import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';

import { CriarPedidoDto } from './dto/criar-pedido.dto';
import { FiltrosPedidoDto } from './dto/filtros-pedido.dto';
import { PedidoService } from './pedido.service';

@Controller('pedido')
export class PedidoController {
  constructor(private readonly pedidoService: PedidoService) {}

  @EventPattern('criar-pedido')
  async criarPedido(@Payload() criarPedidoDto: CriarPedidoDto) {
    return this.pedidoService.criarPedido(criarPedidoDto);
  }

  @EventPattern('atualizar-pedido-pago')
  async atualizarPedidoPago(@Payload() idPagamento: string) {
    return this.pedidoService.atualizarPedidoPago(idPagamento);
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
