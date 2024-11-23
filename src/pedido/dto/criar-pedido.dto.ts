import { IItem } from '../interfaces/item.interface';

export class CriarPedidoDto {
  total: number;
  idComprador: string;
  itens: IItem[];
  idPagamento: string;
}
