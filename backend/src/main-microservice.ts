import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { ReportsModule } from './reports/reports.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Microservice');
  const app = await NestFactory.create(ReportsModule);
  const configService = app.get(ConfigService);
  
  const microservice = app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [configService.get<string>('RABBITMQ_URL') || process.env.RABBITMQ_URL || 'amqp://localhost:5672'],
      queue: 'reports_queue',
      queueOptions: {
        durable: true,
      },
    },
  });

  await app.startAllMicroservices();
  logger.log('Microservice is listening');
}
bootstrap();