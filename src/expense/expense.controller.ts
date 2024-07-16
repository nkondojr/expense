import { Controller, Get, Post, Body, Param, Delete, UseGuards, Query, Res, HttpException, HttpStatus, BadRequestException } from '@nestjs/common';
import { ExpenseService } from './expense.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { JwtAuthGuard } from 'src/authentication/guards/jwt-auth.guard';
import * as express from 'express';

@Controller('api/expense')
@UseGuards(JwtAuthGuard)
export class ExpenseController {
  constructor(private readonly expenseService: ExpenseService) { }

  @Post()
  async create(@Body() createExpenseDto: CreateExpenseDto): Promise<{ message: string }> {
    return this.expenseService.create(createExpenseDto);
  }

  @Get()
  async findAll(
    @Query('search') search: string,
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 10,
  ): Promise<any> {
    return this.expenseService.findAll(search, page, pageSize);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<any> {
    return this.expenseService.findOne(id);
  }

  @Get('report/pdf')
  async getPdfReport(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Res() res: express.Response) {
    const filePath = await this.expenseService.generatePdfReport(startDate, endDate);
    res.download(filePath);
  }

  @Get('generate/excel')
  async generateExcel(@Res() res: express.Response): Promise<void> {
    const buffer = await this.expenseService.generateExcel();

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=expenses.xlsx');
    res.send(buffer);
  }
}
