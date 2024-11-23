import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { StatusPedidoEnum } from '../enum/status-pedido.enum';
import { IItem } from '../interfaces/item.interface';

@Schema({ timestamps: true, collection: 'pedidos' })
export class Pedido {
  @Prop({ required: true })
  id: string;

  @Prop({ required: true })
  idComprador: string;

  @Prop({ required: false })
  idFarmacia: string;

  @Prop({ required: false })
  idEntregador: string;

  @Prop({ required: true })
  enderecoEntrega: string;

  @Prop({ required: true })
  total: number;

  @Prop({ required: false })
  idCupom: string;

  @Prop({ required: true, default: StatusPedidoEnum.AGUARDANDO_PAGAMENTO })
  status: string;

  @Prop({
    required: true,
    type: [{ idProduto: String, quantidade: Number, precoUnitario: Number }],
  })
  itens: IItem[];

  @Prop({ required: true })
  idPagamento: string;
}

export const PedidoSchema = SchemaFactory.createForClass(Pedido);
