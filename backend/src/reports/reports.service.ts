
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ClientProxy, ClientProxyFactory, Transport } from '@nestjs/microservices';
import { User, UserDocument } from '../users/schemas/user.schema';
import { ExpensesService } from '../expenses/expenses.service';
import { UsersService } from '../users/users.service';
import { ConfigService } from '@nestjs/config';
import { GENERATE_REPORT_PATTERN } from '../../constants';

interface ReportData {
  userId: string;
  userName: string;
  userEmail: string;
  month: string;
  year: number;
  format: string;
  totalExpenses: number;
  categoryTotals: Record<string, number>;
}

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
    const rabbitmqUrl = process.env.RABBITMQ_URL || 'amqp://localhost:5672';
    this.logger.log(`Connecting to RabbitMQ at: ${rabbitmqUrl}`);
    
    this.client = ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: [rabbitmqUrl],
        queue: 'reports_queue',
        queueOptions: {
          durable: true,
        },
      },
    });
  }

  // Get expenses for a specific date range
  async getExpensesForDateRange(userId: string, startDate: Date, endDate: Date) {
    try {
      const result = await this.expensesService.findAll(
        userId,
        { page: 1, limit: 1000 },
        { 
          startDate: startDate.toISOString(), 
          endDate: endDate.toISOString() 
        }
      );
      
      return result.data || [];
    } catch (error) {
      this.logger.error(`Error fetching expenses for date range: ${error.message}`, error.stack);
      throw error;
    }
  }

  // Queue report generation
  async queueReportGeneration(reportData: ReportData) {
    try {
      // Ensure client is connected
      if (!this.client) {
        this.logger.error('RabbitMQ client is not initialized');
        throw new Error('RabbitMQ client is not initialized');
      }
      
      this.logger.log(`Queueing report generation for user: ${reportData.userId}`);
      this.logger.log(`Report data: ${JSON.stringify({
        userId: reportData.userId,
        userEmail: reportData.userEmail,
        month: reportData.month,
        year: reportData.year,
        format: reportData.format,
        totalExpenses: reportData.totalExpenses
      })}`);
      
      // Emit the event to RabbitMQ
      this.client.emit(GENERATE_REPORT_PATTERN, reportData);
      
      this.logger.log(`Report generation successfully queued for user: ${reportData.userId}`);
      return true;
    } catch (error) {
      this.logger.error(`Error queueing report generation: ${error.message}`, error.stack);
      throw error;
    }
  }

  // Generate report for a specific month and year
  async generateReport(userId: string, startDate: Date, endDate: Date, format: string): Promise<ReportData> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

   
    const expenses = await this.expensesService.findByDateRange(userId, startDate, endDate);
    
  
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    
   
    const categoryTotals: Record<string, number> = {};
    for (const expense of expenses) {
      if (expense.category) {
        const categoryName = expense.category.name || 'Uncategorized';
        categoryTotals[categoryName] = (categoryTotals[categoryName] || 0) + expense.amount;
      } else {
        categoryTotals['Uncategorized'] = (categoryTotals['Uncategorized'] || 0) + expense.amount;
      }
    }
    
    // Extract month and year from the startDate for reporting purposes
    const month = new Date(startDate).toLocaleString('default', { month: 'long' });
    const year = new Date(startDate).getFullYear();
    
 
    const reportData: ReportData = {
      userId,
      userName: user.name,
      userEmail: user.email,
      month,
      year,
      format,
      totalExpenses,
      categoryTotals,
    };
    
   
    await this.queueReportGeneration(reportData);
    
    return reportData;
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
        const expenses = await this.getExpensesForDateRange(
          user._id ? user._id.toString() : '',
          lastMonth,
          endOfLastMonth
        );
        
        const monthName = lastMonth.toLocaleString('default', { month: 'long' });
        const year = lastMonth.getFullYear();
        
        // Calculate summary data
        const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
        const categoryTotals = {};
        
        expenses.forEach(expense => {
          const categoryName = expense.category ? expense.category.name : 'Uncategorized';
          if (!categoryTotals[categoryName]) {
            categoryTotals[categoryName] = 0;
          }
          categoryTotals[categoryName] += expense.amount;
        });
        
        // Queue report generation
        await this.queueReportGeneration({
          userId: user._id ? user._id.toString() : '',
          userEmail: user.email,
          userName: user.name,
          month: monthName,
          year,
          totalExpenses,
          categoryTotals,
          format: 'pdf',
        });
        
      } catch (error) {
        this.logger.error(`Error generating report for user: ${user._id ? user._id.toString() : ''}`, error.stack);
      }
    }
    
    this.logger.log('Monthly reports generation completed');
  }
}