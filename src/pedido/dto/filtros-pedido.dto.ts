import { OrderEnum } from '../../shared/enum/order.enum';
import { Pedido } from '../schema/pedido.schema';

export class FiltrosPedidoDto {
  idComprador?: string;
  idFarmacia?: string;
  status?: string;
  skip?: number;
  limit?: number;
  order?: OrderEnum;
  orderBy?: keyof Pedido;
}
