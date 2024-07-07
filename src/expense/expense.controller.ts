import { Controller, Get, Post, Body, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { ExpenseService } from './expense.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { Expense } from './entities/expense.entity';
import { JwtAuthGuard } from 'src/authentication/guards/jwt-auth.guard';

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
}
