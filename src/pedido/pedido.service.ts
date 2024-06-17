import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { firstValueFrom } from 'rxjs';
import { v4 as uuid } from 'uuid';

import { ClientProxyService } from '../client-proxy/client-proxy.service';
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
}
