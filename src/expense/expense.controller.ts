import { Controller, Get, Post, Body, Param, Delete, UseGuards } from '@nestjs/common';
import { ExpenseService } from './expense.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { Expense } from './entities/expense.entity';
import { plainToClass } from 'class-transformer';
import { JwtAuthGuard } from 'src/authentication/guards/jwt-auth.guard';

@Controller('api/expenses')
@UseGuards(JwtAuthGuard)
export class ExpenseController {
  constructor(private readonly expenseService: ExpenseService) {}

  @Post()
  async create(@Body() createExpenseDto: CreateExpenseDto): Promise<Expense> {
    return this.expenseService.create(createExpenseDto);
  }

  @Get()
  async findAll(): Promise<Expense[]> {
    return this.expenseService.findAll();
  }
  
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Expense> {
    const expense = await this.expenseService.findOne(id);
    return plainToClass(Expense, expense);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.expenseService.remove(id);
  }
}
