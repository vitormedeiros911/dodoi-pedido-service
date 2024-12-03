import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { firstValueFrom } from 'rxjs';
import { v4 as uuid } from 'uuid';

import { ClientProxyService } from '../client-proxy/client-proxy.service';
import { OrderEnum } from '../shared/enum/order.enum';
import { formatEnderecoToString } from '../shared/functions/formatEnderecoToString';
import { IUsuario } from '../shared/interfaces/usuario.interface';
import { CriarPedidoDto } from './dto/criar-pedido.dto';
import { FiltrosPedidoDto } from './dto/filtros-pedido.dto';
import { StatusPedidoEnum } from './enum/status-pedido.enum';
import { IFarmacia } from './interfaces/farmacia.interface';
import { Pedido } from './schema/pedido.schema';

@Injectable()
export class PedidoService {
  constructor(
    @InjectModel('Pedido') private readonly pedidoModel: Model<Pedido>,
    private readonly clientProxyService: ClientProxyService,
  ) {}

  private clientProdutoBackend =
    this.clientProxyService.getClientProxyProdutoServiceInstance();

  private clientPagamentoBackend =
    this.clientProxyService.getClientProxyPagamentoServiceInstance();

  private clientNotificacaoBackend =
    this.clientProxyService.getClientProxyNotificacaoServiceInstance();

  private clientUsuarioBackend =
    this.clientProxyService.getClientProxyUsuarioServiceInstance();

  private clientFarmaciaBackend =
    this.clientProxyService.getClientProxyFarmaciaServiceInstance();

  async criarPedido(criarPedidoDto: CriarPedidoDto): Promise<Pedido> {
    const novoPedido = new this.pedidoModel({
      id: uuid(),
      codigo:
        Date.now().toString().slice(-5) + uuid().slice(-5).toLocaleUpperCase(),
      ...criarPedidoDto,
    });

    for (const item of criarPedidoDto.itens) {
      this.clientProdutoBackend.emit('reduzir-estoque', {
        idProduto: item.idProduto,
        quantidade: item.quantidade,
      });
    }

    return novoPedido.save();
  }

  async listarPedidos(filtrosPedidoDto: FiltrosPedidoDto) {
    const { idComprador, idFarmacia, status, skip, limit, order, orderBy } =
      filtrosPedidoDto;

    const query = this.pedidoModel
      .find()
      .select(['id', 'historicoStatus', 'total', 'createdAt', 'codigo']);

    if (idComprador) query.where('idComprador').equals(idComprador);

    if (idFarmacia) query.where('idFarmacia').equals(idFarmacia);

    if (status)
      query.where({
        'historicoStatus.status': { $in: status },
      });

    if (order && orderBy)
      query.sort({ [orderBy]: order === OrderEnum.ASC ? 'asc' : 'desc' });

    const countQuery = this.pedidoModel
      .find(query.getFilter())
      .countDocuments();

    if (skip) query.skip(skip);

    if (limit) query.limit(limit);

    const pedidos = await query.exec();
    const total = await countQuery.exec();

    return {
      total,
      pedidos,
    };
  }

  async aceitarPedido(idPedido: string) {
    const pedido = await this.pedidoModel.findOne({ id: idPedido });

    await this.pedidoModel.updateOne(
      { id: idPedido },
      {
        historicoStatus: [
          ...pedido.historicoStatus,
          {
            status: StatusPedidoEnum.EM_SEPARACAO,
            data: new Date(),
          },
        ],
      },
    );

    this.clientNotificacaoBackend.emit('send-notification', {
      titulo: 'Pedido aceito',
      mensagem: `Seu pedido #${pedido.codigo} está em separação.`,
      tagKey: 'idUsuario',
      tagValue: pedido.idComprador,
    });
  }

  async atualizarPedidoPago(idPagamento: string) {
    const pedido = await this.pedidoModel.findOne({ idPagamento });

    await this.pedidoModel.updateOne(
      { id: pedido.id },
      {
        historicoStatus: [
          ...pedido.historicoStatus,
          {
            status: StatusPedidoEnum.PENDENTE,
            data: new Date(),
          },
        ],
      },
    );

    this.clientNotificacaoBackend.emit('send-notification', {
      titulo: 'Pagamento aprovado',
      mensagem: `O pagamento do pedido #${pedido.codigo} foi aprovado.`,
      tagKey: 'idUsuario',
      tagValue: pedido.idComprador,
    });

    this.clientNotificacaoBackend.emit('send-notification', {
      titulo: 'Novo pedido',
      mensagem: `Você tem um novo pedido #${pedido.codigo}.`,
      tagKey: 'idFarmacia',
      tagValue: pedido.idFarmacia,
    });
  }

  async buscarPedidoPorId(idPedido: string) {
    const pedido = await this.pedidoModel.findOne({ id: idPedido }).exec();

    const cliente: IUsuario = await firstValueFrom(
      this.clientUsuarioBackend.send(
        'buscar-contato-usuario',
        pedido.idComprador,
      ),
    );

    const farmacia: IFarmacia = await firstValueFrom(
      this.clientFarmaciaBackend.send(
        'buscar-farmacia-reduzida',
        pedido.idFarmacia,
      ),
    );

    return {
      ...pedido.toJSON(),
      farmacia,
      cliente: {
        nome: cliente.nome,
        endereco: formatEnderecoToString(cliente.endereco),
        telefone: cliente.telefone,
      },
    };
  }

  async cancelarPedido(idPedido: string) {
    const pedido = await this.pedidoModel.findOne({ id: idPedido });

    const ultimoStatus =
      pedido.historicoStatus[pedido.historicoStatus.length - 1];

    if (ultimoStatus.status === StatusPedidoEnum.AGUARDANDO_PAGAMENTO) {
      await this.pedidoModel.deleteOne({ id: idPedido });
    } else {
      await this.pedidoModel.updateOne(
        { id: idPedido },
        {
          historicoStatus: [
            ...pedido.historicoStatus,
            {
              status: StatusPedidoEnum.CANCELADO,
              data: new Date(),
            },
          ],
        },
      );

      this.clientPagamentoBackend.emit(
        'estornar-pagamento',
        pedido.idPagamento,
      );
    }

    for (const item of pedido.itens) {
      this.clientProdutoBackend.emit('aumentar-estoque', {
        idProduto: item.idProduto,
        quantidade: item.quantidade,
      });
    }

    this.clientNotificacaoBackend.emit('send-notification', {
      titulo: 'Pedido cancelado',
      mensagem: `O pedido #${pedido.codigo} foi cancelado.`,
      tagKey: 'idUsuario',
      tagValue: pedido.idComprador,
    });
  }

  async iniciarEntrega(idPedido: string) {
    const pedido = await this.pedidoModel.findOne({ id: idPedido });

    await this.pedidoModel.updateOne(
      { id: idPedido },
      {
        historicoStatus: [
          ...pedido.historicoStatus,
          {
            status: StatusPedidoEnum.ENVIADO,
            data: new Date(),
          },
        ],
      },
    );

    this.clientNotificacaoBackend.emit('send-notification', {
      titulo: 'Pedido enviado',
      mensagem: `O seu pedido #${pedido.codigo} foi enviado!`,
      tagKey: 'idUsuario',
      tagValue: pedido.idComprador,
    });
  }

  async finalizarEntrega(idPedido: string) {
    const pedido = await this.pedidoModel.findOne({ id: idPedido });

    await this.pedidoModel.updateOne(
      { id: idPedido },
      {
        historicoStatus: [
          ...pedido.historicoStatus,
          {
            status: StatusPedidoEnum.ENTREGUE,
            data: new Date(),
          },
        ],
      },
    );

    this.clientNotificacaoBackend.emit('send-notification', {
      titulo: 'Pedido entregue',
      mensagem: `O pedido #${pedido.codigo} foi entregue.`,
      tagKey: 'idFarmacia',
      tagValue: pedido.idFarmacia,
    });
  }
}
