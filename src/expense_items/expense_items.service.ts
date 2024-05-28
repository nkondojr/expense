import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExpenseItem } from './entities/expense_item.entity';
import { CreateExpenseItemDto } from './dto/create-expense_item.dto';

@Injectable()
export class ExpenseItemsService {
  constructor(
    @InjectRepository(ExpenseItem)
    private expenseItemsRepository: Repository<ExpenseItem>,
  ) {}

  async create(createExpenseItemDto: CreateExpenseItemDto): Promise<ExpenseItem> {
    const expenseItem = this.expenseItemsRepository.create(createExpenseItemDto);
    return this.expenseItemsRepository.save(expenseItem);
  }

  async findAll(): Promise<ExpenseItem[]> {
    return this.expenseItemsRepository.find();
  }

  async findOne(id: string): Promise<ExpenseItem> {
    return this.expenseItemsRepository.findOne({ where: { id}});
  }

  async remove(id: string): Promise<void> {
    await this.expenseItemsRepository.delete(id);
  }
}
