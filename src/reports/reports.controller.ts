import { Controller, Get, Body, Res, Put, UseGuards, HttpStatus, Post, Query } from '@nestjs/common';
import { ReportsService } from './reports.service';
import * as express from 'express';
import { JwtAuthGuard } from 'src/authentication/guards/jwt-auth.guard';

@Controller('reports')
@UseGuards(JwtAuthGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) { }

  @Post('pdf')
  async getPdfReport(
    @Body() payload: { start_date: string; end_date: string; categoryIds: string[] },
    @Res() res: express.Response
  ) {
    const { start_date, end_date, categoryIds } = payload;
    try {
      const filePath = await this.reportsService.generatePdfReport(start_date, end_date, categoryIds);
      res.download(filePath);
    } catch (error) {
      // Handle any errors (e.g., logging and sending an error response)
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).send('An error occurred while generating the report');
    }
  }

  @Get('excel')
  async generateExcel(@Res() res: express.Response): Promise<void> {
    const buffer = await this.reportsService.generateExcel();
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=expense-report.xlsx');
    res.send(buffer);
  }

  @Get('dashboard-data')
  async getDashboardData() {
    return this.reportsService.getDashboardData();
  }

}
