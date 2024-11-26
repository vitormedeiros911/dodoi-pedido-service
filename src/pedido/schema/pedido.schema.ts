import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { StatusPedidoEnum } from '../enum/status-pedido.enum';
import { IFarmacia } from '../interfaces/farmacia.interface';
import { IItem } from '../interfaces/item.interface';
import { IEndereco } from '../interfaces/endereco.interface';

@Schema({ timestamps: true, collection: 'pedidos' })
export class Pedido {
  @Prop({ required: true })
  id: string;

  @Prop({ required: false })
  codigo: string;

  @Prop({ required: true })
  idComprador: string;

  @Prop({
    type: {
      id: { type: String, required: false },
      nome: { type: String, required: false },
    },
  })
  farmacia: IFarmacia;

  @Prop({ required: false })
  idEntregador: string;

  @Prop({
    type: {
      logradouro: { type: String, required: false },
      numero: { type: String, required: false },
      complemento: { type: String, required: false },
      bairro: { type: String, required: false },
      cidade: { type: String, required: false },
      uf: { type: String, required: false },
      cep: { type: String, required: false },
    },
    required: false,
  })
  endereco: IEndereco;

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

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const PedidoSchema = SchemaFactory.createForClass(Pedido);
