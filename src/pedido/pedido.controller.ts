import { Controller } from '@nestjs/common';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';

import { formatStatusPedido } from '../shared/functions/formatStatusPedido';
import { CriarPedidoDto } from './dto/criar-pedido.dto';
import { FiltrosPedidoDto } from './dto/filtros-pedido.dto';
import { PedidoService } from './pedido.service';

@Controller('pedido')
export class PedidoController {
  constructor(private readonly pedidoService: PedidoService) {}

  @EventPattern('criar-pedido')
  async criarPedido(@Payload() criarPedidoDto: CriarPedidoDto) {
    await this.pedidoService.criarPedido(criarPedidoDto);
  }

  @EventPattern('atualizar-pedido-pago')
  async atualizarPedidoPago(@Payload() idPagamento: string) {
    await this.pedidoService.atualizarPedidoPago(idPagamento);
  }

  @EventPattern('listar-pedidos')
  async listarPedidos(@Payload() filtrosPedidoDto: FiltrosPedidoDto) {
    const { pedidos, total } =
      await this.pedidoService.listarPedidos(filtrosPedidoDto);

    const pedidosAtualizados = pedidos.map((pedido) => {
      return {
        id: pedido.id,
        total: pedido.total,
        status: formatStatusPedido(
          pedido.historicoStatus[pedido.historicoStatus.length - 1].status,
        ),
        createdAt: pedido.createdAt,
        codigo: pedido.codigo,
      };
    });

    return { pedidos: pedidosAtualizados, total };
  }

  @EventPattern('aceitar-pedido')
  async aceitarPedido(@Payload() idPedido: string) {
    await this.pedidoService.aceitarPedido(idPedido);
  }

  @MessagePattern('buscar-pedido-por-id')
  async buscarPedidoPorId(@Payload() idPedido: string) {
    return this.pedidoService.buscarPedidoPorId(idPedido);
  }

  @EventPattern('cancelar-pedido')
  async cancelarPedido(@Payload() idPedido: string) {
    await this.pedidoService.cancelarPedido(idPedido);
  }

  @EventPattern('iniciar-entrega')
  async iniciarEntrega(@Payload() idPedido: string) {
    await this.pedidoService.iniciarEntrega(idPedido);
  }

  @EventPattern('pedido-entregue')
  async pedidoEntregue(@Payload() idPedido: string) {
    await this.pedidoService.pedidoEntregue(idPedido);
  }
}
