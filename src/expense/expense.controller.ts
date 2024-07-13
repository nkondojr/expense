import { Controller, Get, Post, Body, Param, Delete, UseGuards, Query, Res } from '@nestjs/common';
import { ExpenseService } from './expense.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { Expense } from './entities/expense.entity';
import { JwtAuthGuard } from 'src/authentication/guards/jwt-auth.guard';
import * as express from 'express';


@Controller('api/expense')
@UseGuards(JwtAuthGuard)
export class ExpenseController {
  constructor(private readonly expenseService: ExpenseService) {}

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

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.expenseService.remove(id);
  }


  @Get('report/pdf')
  async getPdfReport(@Res() res: express.Response) {
    const filePath = await this.expenseService.generatePdfReport();
    res.download(filePath);
  }

  @Get('report/excel')
  async getCsvReport(@Res() res: express.Response) {
    const filePath = await this.expenseService.generateCsvReport();
    res.download(filePath);
  }
}
