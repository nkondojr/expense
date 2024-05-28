import { Controller, Get, Post, Body, Param, Delete, UseGuards } from '@nestjs/common';
import { CreateExpenseItemDto } from './dto/create-expense_item.dto';
import { ExpenseItemsService } from './expense_items.service';
import { ExpenseItem } from './entities/expense_item.entity';
import { JwtAuthGuard } from 'src/authentication/guards/jwt-auth.guard';

@Controller('expense-items')
@UseGuards(JwtAuthGuard)
export class ExpenseItemsController {
  constructor(private readonly expenseItemsService: ExpenseItemsService) {}

  @Post()
  async create(@Body() createExpenseItemDto: CreateExpenseItemDto): Promise<ExpenseItem> {
    return this.expenseItemsService.create(createExpenseItemDto);
  }

  @Get()
  async findAll(): Promise<ExpenseItem[]> {
    return this.expenseItemsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ExpenseItem> {
    return this.expenseItemsService.findOne(id);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.expenseItemsService.remove(id);
  }
}
