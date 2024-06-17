import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { ClientProxyModule } from '../client-proxy/client-proxy.module';
import { PedidoController } from './pedido.controller';
import { PedidoService } from './pedido.service';
import { PedidoSchema } from './schema/pedido.schema';

@Module({
  imports: [
    ClientProxyModule,
    MongooseModule.forFeature([{ name: 'Pedido', schema: PedidoSchema }]),
  ],
  controllers: [PedidoController],
  providers: [PedidoService],
})
export class PedidoModule {}
