import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { OrderEnum } from 'src/shared/enum/order.enum';
import { v4 as uuid } from 'uuid';

import { ClientProxyService } from '../client-proxy/client-proxy.service';
import { CriarPedidoDto } from './dto/criar-pedido.dto';
import { FiltrosPedidoDto } from './dto/filtros-pedido.dto';
import { StatusPedidoEnum } from './enum/status-pedido.enum';
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
    const {
      idComprador,
      idFarmacia,
      idEntregador,
      status,
      skip,
      limit,
      order,
      orderBy,
    } = filtrosPedidoDto;

    const query = this.pedidoModel
      .find()
      .select(['id', 'status', 'total', 'createdAt', 'codigo']);

    if (idComprador) query.where('idComprador').equals(idComprador);

    if (idFarmacia) query.where('idFarmacia').equals(idFarmacia);

    if (idEntregador) query.where('idEntregador').equals(idEntregador);

    if (status) query.where('status').equals(status);

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
    await this.pedidoModel.updateOne(
      { id: idPedido },
      { status: StatusPedidoEnum.EM_SEPARACAO },
    );
  }

  async atualizarPedidoPago(idPagamento: string) {
    await this.pedidoModel.updateOne(
      { idPagamento },
      { status: StatusPedidoEnum.PENDENTE },
    );
  }

  async buscarPedidoPorId(idPedido: string) {
    return this.pedidoModel.findOne({ id: idPedido });
  }

  async cancelarPedido(idPedido: string) {
    const pedido = await this.pedidoModel.findOne({ id: idPedido });

    if (pedido.status === StatusPedidoEnum.AGUARDANDO_PAGAMENTO) {
      await this.pedidoModel.deleteOne({ id: idPedido });
    } else {
      await this.pedidoModel.updateOne(
        { id: idPedido },
        { status: StatusPedidoEnum.CANCELADO },
      );

      for (const item of pedido.itens) {
        this.clientProdutoBackend.emit('aumentar-estoque', {
          idProduto: item.idProduto,
          quantidade: item.quantidade,
        });
      }

      this.clientPagamentoBackend.emit(
        'estornar-pagamento',
        pedido.idPagamento,
      );
    }
  }

  async iniciarEntrega(idPedido: string) {
    await this.pedidoModel.updateOne(
      { id: idPedido },
      { status: StatusPedidoEnum.ENVIADO },
    );
  }
}
