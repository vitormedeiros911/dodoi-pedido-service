import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { firstValueFrom } from 'rxjs';
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

  private clientUsuarioBackend =
    this.clientProxyService.getClientProxyUsuarioServiceInstance();

  async criarPedido(criarPedidoDto: CriarPedidoDto): Promise<Pedido> {
    const usuario = await firstValueFrom(
      this.clientUsuarioBackend.send(
        'buscar-endereco-por-id-usuario',
        criarPedidoDto.idComprador,
      ),
    );

    const enderecoEntrega = `${usuario.rua}, ${usuario.numero}, ${usuario.bairro}, ${usuario.cidade}, ${usuario.estado}, ${usuario.cep}`;

    const novoPedido = new this.pedidoModel({
      id: uuid(),
      enderecoEntrega,
      ...criarPedidoDto,
    });

    return novoPedido.save();
  }

  async listarPedidos(filtrosPedidoDto: FiltrosPedidoDto) {
    const { idComprador, idFarmacia, idEntregador, status, skip, limit } =
      filtrosPedidoDto;

    const query = this.pedidoModel.find();

    if (idComprador) query.where('idComprador').equals(idComprador);

    if (idFarmacia) query.where('idFarmacia').equals(idFarmacia);

    if (idEntregador) query.where('idEntregador').equals(idEntregador);

    if (status) query.where('status').equals(status);

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
    return this.pedidoModel.updateOne(
      { id: idPedido },
      { status: StatusPedidoEnum.EM_SEPARACAO },
    );
  }
}
