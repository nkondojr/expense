import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { Expense } from './entities/expense.entity';
import { ExpenseItem } from 'src/expense_items/entities/expense_item.entity';
import { saveImage } from 'utils/image.utils';

@Injectable()
export class ExpenseService {
  constructor(
    @InjectRepository(Expense)
    private expenseRepository: Repository<Expense>,
    @InjectRepository(ExpenseItem)
    private expenseItemsRepository: Repository<ExpenseItem>,
  ) {}

// ***********************************************************************************************************************************************
  async create(createExpenseDto: CreateExpenseDto): Promise<Expense> {
    const { date, amount, description, attachment, expenseItems } = createExpenseDto;
    const imageUrl = saveImage(attachment);

    const expense = this.expenseRepository.create({
      date,
      amount,
      description,
      attachment: imageUrl, // Use the imageUrl instead of attachment
    });

    const savedExpense = await this.expenseRepository.save(expense);

    const expenseItemsEntities = expenseItems.map(item => {
      const expenseItem = new ExpenseItem();
      expenseItem.quantity = item.quantity;
      expenseItem.price = item.price;
      expenseItem.expense = savedExpense;
      expenseItem.product = { id: item.productId } as any; // Assuming product entity is referenced by ID
      return expenseItem;
    });

    await this.expenseItemsRepository.save(expenseItemsEntities);

    return savedExpense;
  }
 
// ***********************************************************************************************************************************************

  async findAll(searchTerm?: string, page: number = 1, pageSize: number = 10): Promise<any> {
    const query = this.expenseRepository.createQueryBuilder('expense')
      .select([
        'expense.id',
        'expense.date',
        'expense.amount',
        'expense.description',
        'expense.attachment',
        'expense.createdAt',
      ]);

    if (searchTerm) {
      query.where('expense.description LIKE :searchTerm', { searchTerm: `%${searchTerm}%` });
    }

    query.skip((page - 1) * pageSize).take(pageSize);

    const [expenses, total] = await query.getManyAndCount();
    const lastPage = Math.ceil(total / pageSize);

    const result = expenses.map(expense => ({
      id: expense.id,
      date: expense.date,
      amount: expense.amount,
      description: expense.description,
      attachment: expense.attachment,
      createdAt: expense.createdAt,
    }));

    return {
      links: {
        next: page < lastPage ? `/expenses?page=${page + 1}&pageSize=${pageSize}` : null,
        previous: page > 1 ? `/expenses?page=${page - 1}&pageSize=${pageSize}` : null
      },
      count: total,
      lastPage: lastPage,
      currentPage: page,
      data: result
    };
  }

// ***********************************************************************************************************************************************

  async findOne(id: string): Promise<any> {
    const expense = await this.expenseRepository.findOne({
      where: { id },
      relations: ['expenseItems', 'expenseItems.product'],
    });

    if (!expense) {
      throw new NotFoundException(`Expense with ID ${id} not found`);
    }
    
    // Transform the expense object
    const result = {
      id: expense.id,
      date: expense.date,
      amount: expense.amount,
      description: expense.description,
      attachment: expense.attachment,
      createdAt: expense.createdAt,
      expenseItems: expense.expenseItems.map(item => ({
        id: item.id,
        quantity: item.quantity,
        price: item.price,
        productId: item.product.id,
        productName: item.product.name,
      })),
    };
    return result;
  }

// ***********************************************************************************************************************************************
  async remove(id: string): Promise<void> {
    await this.expenseRepository.delete(id);
  }
}
