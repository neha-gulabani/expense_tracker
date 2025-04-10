import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  
  // Connect to RabbitMQ for microservice communication
  const rabbitmqUrl = process.env.RABBITMQ_URL || 'amqp://localhost:5672';
  console.log(`Connecting to RabbitMQ at: ${rabbitmqUrl}`);
  
  app.connectMicroservice({
    transport: Transport.RMQ,
    options: {
      urls: [rabbitmqUrl],
      queue: 'reports_queue',
      queueOptions: {
        durable: true,
      },
    },
  });
  
  await app.startAllMicroservices();
  console.log('Microservice is listening');
  
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
  }));
  
  const port = configService.get<number>('PORT') || 3000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
}
bootstrap();