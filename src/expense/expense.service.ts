import { BadRequestException, ConflictException, Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { Expense } from './entities/expense.entity';
import { ExpenseItem } from 'src/expense_items/entities/expense_item.entity';
import { saveImage } from 'utils/image.utils';
import { isUUID } from 'class-validator';
import { Product } from 'src/products/entities/product.entity';
import * as ExcelJS from 'exceljs';
import { Buffer } from 'buffer';


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
      relations: ['expenseItems', 'expenseItems.product', 'expenseItems.product.category'],
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
        productUnit: item.product.unit,
        categoryName: item.product.category.name,
      })),
    };

    return result;
  }

  // ***********************************************************************************************************************************************
  async generateExcel(): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('EXPENSES');

    // Define headers
    const headerRow = worksheet.addRow(['DATE', 'PRODUCT', 'QUANTITY', 'PRICE', 'AMOUNT']);

    // Apply style to header
    headerRow.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } }; // White font color
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF808080' }, // Gray background color
      };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
    });

    // Fetch all expenses with their related data
    const expenses = await this.expenseRepository.find({
      relations: ['expenseItems', 'expenseItems.product'],
    });

    let lastDate = '';

    // Populate rows with required columns
    expenses.forEach(expense => {
      // Convert expense.date to a Date object if it's not already
      const date = new Date(expense.date);
      const formattedDate = !isNaN(date.getTime()) ? date.toISOString().slice(0, 10) : 'Invalid Date';

      if (formattedDate !== lastDate) {
        if (lastDate) {
          worksheet.addRow([]); // Add an empty row before starting a new date's data
        }
        lastDate = formattedDate;
        const dateRow = worksheet.addRow([formattedDate, '', '', '', '']);
        dateRow.eachCell((cell) => {
          cell.font = { bold: true };
        });
      }

      expense.expenseItems.forEach(item => {
        const row = worksheet.addRow([
          '',
          item.product.name,
          item.quantity,
          item.price,
          item.quantity * item.price // Amount
        ]);

        // Align price and amount to the right and format with comma separator
        row.getCell(4).alignment = { horizontal: 'right' };
        row.getCell(4).numFmt = '#,##0.00'; // Number format with comma separator and two decimal places
        row.getCell(5).alignment = { horizontal: 'right' };
        row.getCell(5).numFmt = '#,##0.00'; // Number format with comma separator and two decimal places
      });
    });

    // Set column width for better visibility
    worksheet.getColumn(1).width = 15;
    worksheet.getColumn(2).width = 25;
    worksheet.getColumn(3).width = 15;
    worksheet.getColumn(4).width = 15;
    worksheet.getColumn(5).width = 20;

    // Generate Excel file
    const buffer: Buffer = await workbook.xlsx.writeBuffer() as Buffer;

    return buffer;
  }

}
