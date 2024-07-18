import { Controller, Get, Post, Body, Patch, Param, Delete, Res, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import * as express from 'express';
import { JwtAuthGuard } from 'src/authentication/guards/jwt-auth.guard';

@Controller('api/reports')
@UseGuards(JwtAuthGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post('pdf')
  async getPdfReport(
    @Body() payload: { startDate: string; endDate: string; categoryId: string },
    @Res() res: express.Response
  ) {
    const { startDate, endDate, categoryId } = payload;
    const filePath = await this.reportsService.generatePdfReport(startDate, endDate, categoryId);
    res.download(filePath);
  }

  @Get('excel')
  async generateExcel(@Res() res: express.Response): Promise<void> {
    const buffer = await this.reportsService.generateExcel();

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=expense-report.xlsx');
    res.send(buffer);
  }
  
}
