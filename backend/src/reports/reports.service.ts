// src/reports/reports.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ClientProxy, ClientProxyFactory, Transport } from '@nestjs/microservices';
import { User, UserDocument } from '../users/schemas/user.schema';
import { ExpensesService } from '../expenses/expenses.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ReportsService {
  private readonly logger = new Logger(ReportsService.name);
  private client: ClientProxy;

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private expensesService: ExpensesService,
    private configService: ConfigService,
  ) {
    // Connect to RabbitMQ
    this.client = ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: [configService.get<string>('RABBITMQ_URL') || 'amqp://localhost:5672'],
        queue: 'reports_queue',
        queueOptions: {
          durable: true,
        },
      },
    });
  }

  // Generate reports at the beginning of each month
  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
  async generateMonthlyReports() {
    this.logger.log('Generating monthly reports...');
    
    // Get all users
    const users = await this.userModel.find().exec();
    
    for (const user of users) {
      try {
        const today = new Date();
        const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
        
        // Get last month's expenses for the user
        const expenses = await this.expensesService.findAll(
          user._id ? user._id.toString() : '',
          { page: 1, limit: 1000 },
          { 
            startDate: lastMonth.toISOString(), 
            endDate: endOfLastMonth.toISOString() 
          }
        );
        
        const monthName = lastMonth.toLocaleString('default', { month: 'long' });
        const year = lastMonth.getFullYear();
        
        // Calculate summary data
        const totalExpenses = expenses.data.reduce((sum, expense) => sum + expense.amount, 0);
        const categoryTotals = {};
        
        expenses.data.forEach(expense => {
          const categoryName = expense.category ? expense.category.name : 'Uncategorized';
          if (!categoryTotals[categoryName]) {
            categoryTotals[categoryName] = 0;
          }
          categoryTotals[categoryName] += expense.amount;
        });
        
        // Send report data to RabbitMQ
        this.client.emit('generate_report', {
          userId: user._id ? user._id.toString() : '',
          userEmail: user.email,
          userName: user.name,
          month: monthName,
          year,
          totalExpenses,
          categoryTotals,
          expenses: expenses.data,
          generatedAt: new Date()
        });
        
        this.logger.log(`Report generation queued for user: ${user._id ? user._id.toString() : ''}`);
      } catch (error) {
        this.logger.error(`Error generating report for user: ${user._id ? user._id.toString() : ''}`, error.stack);
      }
    }
    
    this.logger.log('Monthly reports generation completed');
  }
}