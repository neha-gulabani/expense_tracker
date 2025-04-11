import { Module } from '@nestjs/common';
import { ReportsConsumer } from './reports.consumer';

@Module({
  controllers: [ReportsConsumer],
})
export class ReportsConsumerModule {}
