import { Controller } from '@nestjs/common';
import {
  Ctx,
  EventPattern,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';

import { formatStatusPedido } from '../shared/functions/formatStatusPedido';
import { CriarPedidoDto } from './dto/criar-pedido.dto';
import { FiltrosPedidoDto } from './dto/filtros-pedido.dto';
import { PedidoService } from './pedido.service';

const ackErrors: string[] = ['E11000'];

@Controller('pedido')
export class PedidoController {
  constructor(private readonly pedidoService: PedidoService) {}

  @EventPattern('criar-pedido')
  async criarPedido(
    @Payload() criarPedidoDto: CriarPedidoDto,
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();

    try {
      await this.pedidoService.criarPedido(criarPedidoDto);
      await channel.ack(originalMsg);
    } catch (error) {
      const filterAckError = ackErrors.filter((ackError) =>
        error.message.includes(ackError),
      );

      if (filterAckError.length > 0) await channel.ack(originalMsg);
    }
  }

  @EventPattern('atualizar-pedido-pago')
  async atualizarPedidoPago(
    @Payload() idPagamento: string,
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();

    try {
      await this.pedidoService.atualizarPedidoPago(idPagamento);
      await channel.ack(originalMsg);
    } catch (error) {
      const filterAckError = ackErrors.filter((ackError) =>
        error.message.includes(ackError),
      );

      if (filterAckError.length > 0) await channel.ack(originalMsg);
    }
  }

  @MessagePattern('listar-pedidos')
  async listarPedidos(
    @Payload() filtrosPedidoDto: FiltrosPedidoDto,
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();

    try {
      const { pedidos, total } =
        await this.pedidoService.listarPedidos(filtrosPedidoDto);

      const pedidosAtualizados = pedidos.map((pedido) => {
        return {
          id: pedido.id,
          total: pedido.total,
          status: formatStatusPedido(
            pedido.historicoStatus.status ||
              pedido.historicoStatus[pedido.historicoStatus.length - 1].status,
          ),
          createdAt: pedido.createdAt,
          codigo: pedido.codigo,
        };
      });

      return { pedidos: pedidosAtualizados, total };
    } finally {
      await channel.ack(originalMsg);
    }
  }

  @EventPattern('aceitar-pedido')
  async aceitarPedido(@Payload() idPedido: string, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();

    try {
      await this.pedidoService.aceitarPedido(idPedido);
      await channel.ack(originalMsg);
    } catch (error) {
      const filterAckError = ackErrors.filter((ackError) =>
        error.message.includes(ackError),
      );

      if (filterAckError.length > 0) await channel.ack(originalMsg);
    }
  }

  @MessagePattern('buscar-pedido-por-id')
  async buscarPedidoPorId(
    @Payload() idPedido: string,
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();

    try {
      return this.pedidoService.buscarPedidoPorId(idPedido);
    } finally {
      await channel.ack(originalMsg);
    }
  }

  @EventPattern('cancelar-pedido')
  async cancelarPedido(
    @Payload() idPedido: string,
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();

    try {
      await this.pedidoService.cancelarPedido(idPedido);
      await channel.ack(originalMsg);
    } catch (error) {
      const filterAckError = ackErrors.filter((ackError) =>
        error.message.includes(ackError),
      );

      if (filterAckError.length > 0) await channel.ack(originalMsg);
    }
  }

  @EventPattern('iniciar-entrega')
  async iniciarEntrega(
    @Payload() idPedido: string,
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();

    try {
      await this.pedidoService.iniciarEntrega(idPedido);
      await channel.ack(originalMsg);
    } catch (error) {
      const filterAckError = ackErrors.filter((ackError) =>
        error.message.includes(ackError),
      );

      if (filterAckError.length > 0) await channel.ack(originalMsg);
    }
  }

  @EventPattern('finalizar-entrega')
  async finalizarEntrega(
    @Payload() idPedido: string,
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();

    try {
      await this.pedidoService.finalizarEntrega(idPedido);
      await channel.ack(originalMsg);
    } catch (error) {
      const filterAckError = ackErrors.filter((ackError) =>
        error.message.includes(ackError),
      );

      if (filterAckError.length > 0) await channel.ack(originalMsg);
    }
  }
}
