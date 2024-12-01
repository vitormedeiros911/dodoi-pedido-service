import { StatusPedidoEnum } from '../enum/status-pedido.enum';

export interface IHistoricoStatus {
  status: StatusPedidoEnum;
  data: Date;
}
