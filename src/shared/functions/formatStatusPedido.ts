import { StatusPedidoEnum } from '../../pedido/enum/status-pedido.enum';

export const formatStatusPedido = (status: string) => {
  switch (status) {
    case StatusPedidoEnum.AGUARDANDO_PAGAMENTO:
      return 'Aguardando pagamento';
    case StatusPedidoEnum.PENDENTE:
      return 'Pendente';
    case StatusPedidoEnum.EM_SEPARACAO:
      return 'Em separação';
    case StatusPedidoEnum.ENVIADO:
      return 'Enviado';
    case StatusPedidoEnum.ENTREGUE:
      return 'Entregue';
    case StatusPedidoEnum.CANCELADO:
      return 'Cancelado';
    default:
      return status;
  }
};
