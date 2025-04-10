import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReportsService } from './reports.service';
import { ReportsConsumer } from './reports.consumer';
import { User, UserSchema } from '../users/schemas/user.schema';
import { ExpensesModule } from '../expenses/expenses.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    ExpensesModule,
  ],
  providers: [ReportsService, ReportsConsumer],
})
export class ReportsModule {}