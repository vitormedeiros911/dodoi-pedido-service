import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { firstValueFrom } from 'rxjs';
import { v4 as uuid } from 'uuid';

import { ClientProxyService } from '../client-proxy/client-proxy.service';
import { FiltrosPedidoDto } from './dto/filtros-pedido.dto';
import { Pedido } from './schema/pedido.schema';

@Injectable()
export class PedidoService {
  constructor(
    @InjectModel('Pedido') private readonly pedidoModel: Model<Pedido>,
    private readonly clientProxyService: ClientProxyService,
  ) {}

  private clientUsuarioBackend =
    this.clientProxyService.getClientProxyUsuarioServiceInstance();

  async criarPedido(pedido: Pedido): Promise<Pedido> {
    const usuario = await firstValueFrom(
      this.clientUsuarioBackend.send(
        'buscar-endereco-por-id-usuario',
        pedido.idCliente,
      ),
    );

    pedido.endereco = usuario.endereco;

    const novoPedido = new this.pedidoModel({
      id: uuid(),
      ...pedido,
    });

    return novoPedido.save();
  }

  async listarPedidos(filtrosPedidoDto: FiltrosPedidoDto) {
    const { idCliente, idFarmacia, idEntregador, status, skip, limit } =
      filtrosPedidoDto;

    const query = this.pedidoModel.find();

    if (idCliente) query.where('idCliente').equals(idCliente);

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
}
