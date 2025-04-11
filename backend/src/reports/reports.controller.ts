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
     
      const startDate = new Date(generateReportDto.startDate);
      const endDate = new Date(generateReportDto.endDate);
      
      // Generate the report using the service
      const reportData = await this.reportsService.generateReport(
        req.user.id,
        startDate,
        endDate,
        generateReportDto.format || 'pdf'
      );
      
      return {
        success: true,
        message: `Report generation has been queued. It will be sent to ${reportData.userEmail} when ready.`,
      };
    } catch (error) {
      this.logger.error(`Error generating report: ${error.message}`, error.stack);
      return {
        success: false,
        message: `Failed to generate report: ${error.message}`,
      };
    }
  }
}
