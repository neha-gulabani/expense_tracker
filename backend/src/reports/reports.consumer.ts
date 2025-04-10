import { Controller, Logger } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';

@Controller()
export class ReportsConsumer {
  private readonly logger = new Logger(ReportsConsumer.name);

  @EventPattern('generate_report')
  async handleGenerateReport(data: any) {
    this.logger.log(`Received report generation request for user: ${data.userId}`);

    try {
      // In a real application, we would generate a PDF/HTML report here
      // and send it via email to the user.
      
      // For demonstration purposes, we'll just log the report details
      this.logger.log(`Generating report for ${data.userName} (${data.userEmail})`);
      this.logger.log(`Report period: ${data.month} ${data.year}`);
      this.logger.log(`Total expenses: ${data.totalExpenses}`);
      
      // Log category breakdowns
      this.logger.log('Category breakdown:');
      for (const [category, amount] of Object.entries(data.categoryTotals)) {
        this.logger.log(`  ${category}: ${amount}`);
      }
      
      // Simulate email sending
      this.logger.log(`Email would be sent to: ${data.userEmail}`);
      this.logger.log('Report generation completed successfully');
    } catch (error) {
      this.logger.error(`Error processing report: ${error.message}`, error.stack);
    }
  }
}