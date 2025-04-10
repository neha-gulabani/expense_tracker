import { Controller, Post, Body, Request, UseGuards, Logger } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ReportsService } from './reports.service';

interface GenerateReportDto {
  startDate: string;
  endDate: string;
  format: string;
}

@Controller('reports')
@UseGuards(JwtAuthGuard)
export class ReportsController {
  private readonly logger = new Logger(ReportsController.name);

  constructor(private readonly reportsService: ReportsService) {}

  @Post('generate')
  async generateReport(@Request() req, @Body() generateReportDto: GenerateReportDto) {
    this.logger.log(`Manual report generation requested by user: ${req.user.id}`);
    this.logger.log(`Report parameters: ${JSON.stringify(generateReportDto)}`);
    
    try {
      // Extract date information from the startDate and endDate
      const startDate = new Date(generateReportDto.startDate);
      const endDate = new Date(generateReportDto.endDate);
      
      // Get the user from the request
      const userId = req.user.id;
      const userEmail = req.user.email;
      const userName = req.user.name;
      
      // Get expenses for the date range
      const expenses = await this.reportsService.getExpensesForDateRange(
        userId,
        startDate,
        endDate
      );
      
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
      
      // Extract month and year for compatibility with the consumer
      const month = startDate.toLocaleString('default', { month: 'long' });
      const year = startDate.getFullYear();
      
      // Send report data to RabbitMQ
      await this.reportsService.queueReportGeneration({
        userId,
        userEmail,
        userName,
        startDate,
        endDate,
        month,
        year,
        totalExpenses,
        categoryTotals,
        expenses,
        format: generateReportDto.format || 'pdf',
        generatedAt: new Date()
      });
      
      return { success: true, message: 'Report generation initiated. It will be sent to your email shortly.' };
    } catch (error) {
      this.logger.error(`Error generating report: ${error.message}`, error.stack);
      return { success: false, message: 'Failed to generate report. Please try again later.' };
    }
  }
}
