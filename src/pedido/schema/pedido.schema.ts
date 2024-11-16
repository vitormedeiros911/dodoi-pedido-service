import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { StatusPedidoEnum } from '../enum/status-pedido.enum';
import { IEndereco } from '../interfaces/endereco.interface';
import { IItem } from '../interfaces/item.interface';

@Schema({ timestamps: true, collection: 'pedidos' })
export class Pedido {
  @Prop({ required: true })
  id: string;

  @Prop({ required: true })
  idCliente: string;

  @Prop({ required: true })
  idFarmacia: string;

  @Prop({ required: false })
  idEntregador: string;

  @Prop({
    type: {
      logradouro: { type: String, required: true },
      numero: { type: String, required: true },
      complemento: { type: String, required: false },
      bairro: { type: String, required: true },
      cidade: { type: String, required: true },
      uf: { type: String, required: true },
      cep: { type: String, required: true },
    },
    required: true,
  })
  endereco: IEndereco;

  @Prop({ required: true })
  valorTotal: number;

  @Prop({ required: false })
  idCupom: string;

  @Prop({ required: true, default: StatusPedidoEnum.PENDENTE })
  status: string;

  @Prop({
    required: true,
    type: [{ idProduto: String, quantidade: Number, precoUnitario: Number }],
  })
  itens: IItem[];

  @Prop({ required: false })
  observacao: string;
}

export const PedidoSchema = SchemaFactory.createForClass(Pedido);
