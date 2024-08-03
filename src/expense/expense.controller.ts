import { Controller, Get, Post, Body, Param, UseGuards, Query, Patch, ValidationPipe, UsePipes, Delete } from '@nestjs/common';
import { ExpenseService } from './expense.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { JwtAuthGuard } from 'src/authentication/guards/jwt-auth.guard';
import { UpdateExpenseDto } from './dto/update-expense.dto';

@Controller('expense')
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

  @Patch(':id')
  @UsePipes(new ValidationPipe())
  async update(@Param('id') id: string, @Body() updateExpenseDto: UpdateExpenseDto): Promise<{ message: string }> {
    return this.expenseService.update(id, updateExpenseDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    return this.expenseService.remove(id);
  }
}
