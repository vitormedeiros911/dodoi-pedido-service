import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { v4 as uuid } from 'uuid';

import { Pedido } from './schema/pedido.schema';

@Injectable()
export class PedidoService {
  constructor(
    @InjectModel('Pedido') private readonly pedidoModel: Model<Pedido>,
  ) {}

  async criarPedido(pedido: Pedido): Promise<Pedido> {
    const novoPedido = new this.pedidoModel({
      id: uuid(),
      ...pedido,
    });

    return novoPedido.save();
  }
}
