import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { OrderEnum } from 'src/shared/enum/order.enum';
import { v4 as uuid } from 'uuid';

import { CriarPedidoDto } from './dto/criar-pedido.dto';
import { FiltrosPedidoDto } from './dto/filtros-pedido.dto';
import { StatusPedidoEnum } from './enum/status-pedido.enum';
import { Pedido } from './schema/pedido.schema';

@Injectable()
export class PedidoService {
  constructor(
    @InjectModel('Pedido') private readonly pedidoModel: Model<Pedido>,
  ) {}

  async criarPedido(criarPedidoDto: CriarPedidoDto): Promise<Pedido> {
    const novoPedido = new this.pedidoModel({
      id: uuid(),
      codigo:
        Date.now().toString().slice(-5) + uuid().slice(-5).toLocaleUpperCase(),
      ...criarPedidoDto,
    });

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
    return this.pedidoModel.updateOne(
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
}
