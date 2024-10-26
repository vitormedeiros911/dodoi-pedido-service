import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';

import { FiltrosPedidoDto } from './dto/filtros-pedido.dto';
import { PedidoService } from './pedido.service';
import { Pedido } from './schema/pedido.schema';

@Controller('pedido')
export class PedidoController {
  constructor(private readonly pedidoService: PedidoService) {}

  @EventPattern('criar-pedido')
  async criarPedido(@Payload() pedido: Pedido) {
    return this.pedidoService.criarPedido(pedido);
  }

  @EventPattern('listar-pedidos')
  async listarPedidos(@Payload() filtrosPedidoDto: FiltrosPedidoDto) {
    return this.pedidoService.listarPedidos(filtrosPedidoDto);
  }

  @EventPattern('aceitar-pedido')
  async aceitarPedido(@Payload() idPedido: string) {
    return this.pedidoService.aceitarPedido(idPedido);
  }
}
