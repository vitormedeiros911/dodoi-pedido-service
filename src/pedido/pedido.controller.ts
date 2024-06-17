import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';

import { PedidoService } from './pedido.service';
import { Pedido } from './schema/pedido.schema';

@Controller('pedido')
export class PedidoController {
  constructor(private readonly pedidoService: PedidoService) {}

  @EventPattern('criar-pedido')
  async criarPedido(@Payload() pedido: Pedido) {
    return this.pedidoService.criarPedido(pedido);
  }
}
