import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { StatusPedidoEnum } from '../enum/status-pedido.enum';
import { IEndereco } from '../interfaces/endereco.interface';
import { IItem } from '../interfaces/item.interface';
import { IHistoricoStatus } from '../interfaces/historico-status.interface';

@Schema({ timestamps: true, collection: 'pedidos' })
export class Pedido {
  @Prop({ required: true })
  id: string;

  @Prop({ required: false })
  codigo: string;

  @Prop({ required: true })
  idComprador: string;

  @Prop({ required: true })
  idFarmacia: string;

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

  @Prop({
    required: true,
    type: [
      {
        status: String,
        data: Date,
      },
    ],
    default: [
      {
        status: StatusPedidoEnum.AGUARDANDO_PAGAMENTO,
        data: new Date(),
      },
    ],
  })
  historicoStatus: IHistoricoStatus[];

  @Prop({
    required: true,
    type: [
      {
        idProduto: String,
        quantidade: Number,
        precoUnitario: Number,
        nomeProduto: String,
        urlImagem: String,
      },
    ],
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
