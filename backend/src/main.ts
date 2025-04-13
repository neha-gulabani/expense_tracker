import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { REPORTS_QUEUE } from '../constants';
import { Header } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  
  // Connect to RabbitMQ for microservice communication
  const rabbitmqUrl = process.env.RABBITMQ_URL;
  console.log(`Connecting to RabbitMQ at: ${rabbitmqUrl}`);
  
  app.connectMicroservice({
    transport: Transport.RMQ,
    options: {
      urls: [rabbitmqUrl],
      queue: REPORTS_QUEUE,
      queueOptions: {
        durable: true,
      },
    },
  });
  
  await app.startAllMicroservices();
  console.log('Microservice is listening');
  
  // Configure CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
  }));
  
  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
}
bootstrap();