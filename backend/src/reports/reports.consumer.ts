import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
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

@Controller()
export class ReportsConsumer {
  private readonly logger = new Logger(ReportsConsumer.name);

  @EventPattern(GENERATE_REPORT_PATTERN)
  async handleGenerateReport(@Payload() data: ReportData) {
    this.logger.log(`Received report generation request for user: ${data.userId}`);
    this.logger.log(`Report data received: ${JSON.stringify(data, null, 2)}`);

    try {
      
      this.logger.log(`Generating report for ${data.userName} (${data.userEmail})`);
      this.logger.log(`Report period: ${data.month} ${data.year}`);
      this.logger.log(`Total expenses: ${data.totalExpenses}`);
      
     
      if (data.categoryTotals) {
        this.logger.log('Category breakdown:');
        for (const [category, amount] of Object.entries(data.categoryTotals)) {
          this.logger.log(`  ${category}: ${amount}`);
        }
      } else {
        this.logger.log('No category breakdown available');
      }
      
      // Simulate email sending
      this.logger.log(`Email would be sent to: ${data.userEmail}`);
      this.logger.log('Report generation completed successfully');
      
      return { success: true };
    } catch (error) {
      this.logger.error(`Error processing report: ${error.message}`, error.stack);
      return { success: false, error: error.message };
    }
  }
}