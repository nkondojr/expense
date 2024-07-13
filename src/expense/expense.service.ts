import { BadRequestException, ConflictException, Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { Expense } from './entities/expense.entity';
import { ExpenseItem } from 'src/expense_items/entities/expense_item.entity';
import { saveImage } from 'utils/image.utils';
import { isUUID } from 'class-validator';
import { Product } from 'src/products/entities/product.entity';
import { join } from 'path';
import { createWriteStream, existsSync, mkdirSync, writeFileSync } from 'fs';
import * as PDFDocument from 'pdfkit';
import { Parser } from 'json2csv';



@Injectable()
export class ExpenseService {
  constructor(
    @InjectRepository(Expense)
    private expenseRepository: Repository<Expense>,

    @InjectRepository(ExpenseItem)
    private expenseItemsRepository: Repository<ExpenseItem>,

    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) { }

  // ***********************************************************************************************************************************************
  async create(createExpenseDto: CreateExpenseDto): Promise<{ message: string }> {
    const { date, amount, description, attachment, expenseItems } = createExpenseDto;

    if (!expenseItems || expenseItems.length === 0) {
      throw new BadRequestException('Expense items cannot be empty');
    }

    const invalidUUIDs = expenseItems.filter(item => !isUUID(item.productId));
    if (invalidUUIDs.length > 0) {
      throw new UnprocessableEntityException(`Invalid ID format for product IDs: ${invalidUUIDs.map(item => item.productId).join(', ')}`);
    }

    // Validate product existence for each expense item
    for (const item of expenseItems) {
      const product = await this.productRepository.findOne({ where: { id: item.productId } });
      if (!product) {
        throw new NotFoundException(`Product with id ${item.productId} not found`);
      }
    }

    const imageUrl = saveImage(attachment);

    const expense = this.expenseRepository.create({
      date,
      amount,
      description,
      attachment: imageUrl, // Use the imageUrl instead of attachment
    });

    try {
      // Save the expense
      const savedExpense = await this.expenseRepository.save(expense);

      // Create expense items
      const expenseItemsEntities = expenseItems.map(item => {
        const expenseItem = new ExpenseItem();
        expenseItem.quantity = item.quantity;
        expenseItem.price = item.price;
        expenseItem.expense = savedExpense;
        expenseItem.product = { id: item.productId } as any; // Assuming product entity is referenced by ID
        return expenseItem;
      });

      // Save expense items
      await this.expenseItemsRepository.save(expenseItemsEntities);

      return {
        message: 'Expense created successfully',
      };
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException('Expense already exists');
      } else {
        throw error;
      }
    }
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
        next: page < lastPage ? `/expense?page=${page + 1}&pageSize=${pageSize}` : null,
        previous: page > 1 ? `/expense?page=${page - 1}&pageSize=${pageSize}` : null
      },
      count: total,
      lastPage: lastPage,
      currentPage: page,
      data: result
    };
  }

  // ***********************************************************************************************************************************************
  async findOne(id: string): Promise<any> {
    // Validate the ID format
    if (!isUUID(id)) {
      throw new BadRequestException('Invalid ID format');
    }

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

  // ***********************************************************************************************************************************************
  private ensureReportsDirectoryExists() {
    const reportsDir = join(__dirname, '..', '..', 'reports');
    if (!existsSync(reportsDir)) {
      mkdirSync(reportsDir);
    }
  }

  async generatePdfReport(): Promise<string> {
    this.ensureReportsDirectoryExists();

    const expenses = await this.expenseRepository.find({
      relations: ['expenseItems', 'expenseItems.product'],
    });

    const doc = new PDFDocument();
    const filePath = join(__dirname, '..', '..', 'reports', 'expense-report.pdf');
    doc.pipe(createWriteStream(filePath));

    doc.fontSize(18).text('Expense Report', { align: 'center' });

    expenses.forEach(expense => {
      doc
        .fontSize(12)
        .text(`Date: ${expense.date}`)
        .text(`Amount: ${expense.amount}`)
        .text(`Description: ${expense.description}`)
        .moveDown();

      expense.expenseItems.forEach(item => {
        doc
          .fontSize(10)
          .text(`  Product: ${item.product.name}`)
          .text(`  Quantity: ${item.quantity}`)
          .text(`  Price: ${item.price}`)
          .moveDown();
      });

      doc.moveDown().moveDown();
    });

    doc.end();

    return filePath;
  }

  // ***********************************************************************************************************************************************
  async generateCsvReport(): Promise<string> {
    this.ensureReportsDirectoryExists();

    const expenses = await this.expenseRepository.find({
      relations: ['expenseItems', 'expenseItems.product'],
    });

    const expensesData = expenses.map(expense => ({
      date: expense.date,
      amount: expense.amount,
      description: expense.description,
      expenseItems: expense.expenseItems.map(item => ({
        product: item.product.name,
        quantity: item.quantity,
        price: item.price,
      })),
    }));

    const parser = new Parser();
    const csv = parser.parse(expensesData);
    const filePath = join(__dirname, '..', '..', 'reports', 'expense-report.csv');
    writeFileSync(filePath, csv);

    return filePath;
  }

}
