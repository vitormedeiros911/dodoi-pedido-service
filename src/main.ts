import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import mongoose from 'mongoose';

import { AppModule } from './app.module';
import { LoggingInterceptor } from './shared/middlewares/logging.interceptor';

const logger = new Logger('Main');
const configService = new ConfigService();

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: [
          `amqp://${configService.get<string>('RMQ_USER')}:${configService.get<string>('RMQ_PASSWORD')}@${configService.get<string>('RMQ_HOST')}`,
        ],
        queue: 'pedidos',
      },
    },
  );

  app.useGlobalInterceptors(new LoggingInterceptor());

  mongoose.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (_doc, ret) {
      delete ret._id;
    },
  });

  await app.listen().then(() => logger.log('Executando microserviço'));
}
bootstrap();
