import { BadRequestException, ConflictException, HttpException, HttpStatus, Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { Expense } from './entities/expense.entity';
import { ExpenseItem } from 'src/expense_items/entities/expense_item.entity';
import { saveImage } from 'utils/image.utils';
import { isUUID } from 'class-validator';
import { Product } from 'src/products/entities/product.entity';
import { join } from 'path';
import { createWriteStream, existsSync, mkdirSync } from 'fs';
import * as PDFDocument from 'pdfkit';
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
  private ensureReportsDirectoryExists() {
    const reportsDir = join(__dirname, '..', '..', 'reports');
    if (!existsSync(reportsDir)) {
      mkdirSync(reportsDir);
    }
  }

  async generatePdfReport(startDate: string, endDate: string, categoryId: string): Promise<string> {
    this.ensureReportsDirectoryExists();
    try {
      // Parse start and end dates into Date objects
      const startDateObj = new Date(startDate);
      const endDateObj = new Date(endDate);

      // Build the query conditionally based on the presence of categoryId
      const query: any = {
        date: Between(startDateObj, endDateObj),
      };
      if (categoryId) {
        query.expenseItems = {
          product: {
            category: {
              id: categoryId,
            },
          },
        };
      }

      const expenses = await this.expenseRepository.find({
        where: query,
        relations: ['expenseItems', 'expenseItems.product', 'expenseItems.product.category'],
      });

      const doc = new PDFDocument();
      const filePath = join(__dirname, '..', '..', 'reports', 'expense-report.pdf');
      doc.pipe(createWriteStream(filePath));

      doc.font('Helvetica-Bold').fontSize(18).fillColor('black').text('QELA TECH (T) LTD', { align: 'left', bold: true });
      doc.fontSize(16).fillColor('black').text('General Expense Report', { align: 'left', bold: true }).moveDown();

      let y = 120; // Initial y position for the table

      // Format dates for display
      const formattedStartDate = formatDate(startDateObj);
      const formattedEndDate = formatDate(endDateObj);

      // Write date range to the PDF document
      doc.fontSize(12).text(`From ${formattedStartDate} to ${formattedEndDate}`, {
        align: 'left',
        width: 500,
        continued: false,
      }).moveDown();
      y += 20; // Adjust y position for spacing between expenses

      // Draw table headers only once
      drawTableHeader();

      if (expenses.length === 0) {
        doc.moveTo(70, y + 15).lineTo(550, y + 15).stroke(); // Horizontal line under headers
        y += 0; // Move down after headers
        // If no expenses found, display "No data found"
        doc.fontSize(12).fillColor('black').text('No data found');

      } else {
        let totalAmount = 0;

        expenses.forEach(expense => {
          // Calculate expense.amount from expenseItems
          const calculatedAmount = expense.expenseItems.reduce((sum, item) => sum + item.quantity * item.price, 0);
          totalAmount += calculatedAmount;

          drawExpenseDetails(expense);

          expense.expenseItems.forEach((item, index) => {
            drawExpenseItem(item, index + 1); // Pass index + 1 to start from 1 instead of 0
          });

          drawSubTotal(calculatedAmount);

          y += 20; // Adjust y position for spacing between expenses

        });

        // Draw total amount at the end
        drawTotalAmount(totalAmount);
      }

      doc.end();

      return filePath;

      // Function to draw table header
      function drawTableHeader() {
        doc.moveTo(70, y + 15).lineTo(550, y + 15).stroke(); // Horizontal line under headers
        y += 17; // Move down after headers

        // Draw a gray rectangle as the background for the header
        doc.rect(70, y, 550 - 70, 20).fill('#e0e0e0');
        y += 7; // Move down after headers

        doc
          .fontSize(12)
          .fillColor('#000000')
          .text('Date / Category', 72, y, { bold: true })
          .text('Product', 200, y, { bold: true })
          .text('Qty', 280, y, { bold: true })
          .text('Unit', 310, y, { bold: true })
          .text('Price (TSH)', 370, y, { bold: true })
          .text('Amount (TSH)', 450, y, { align: 'right', bold: true });

        doc.moveTo(70, y + 15).lineTo(550, y + 15).stroke(); // Horizontal line under headers
        y += 30; // Move down after headers
      }

      // Function to draw expense details
      function drawExpenseDetails(expense) {
        doc
          .fontSize(10)
          .text(formatDate(expense.date), 70, y)

        doc.moveTo(70, y + 15).lineTo(550, y + 15).stroke(); // Horizontal line under details
        y += 20; // Move down after details
      }

      // Function to draw expense item
      function drawExpenseItem(item, index) {
        doc
          .fontSize(10)
          .text(index.toString() + ".", 70, y)
          .text(item.product.category.name, 80, y)
          .text(item.product.name, 200, y)
          .text(item.quantity.toString(), 280, y)
          .text(item.product.unit, 310, y)
          .text(formatAmount(item.price), 370, y)
          .text(formatAmount(item.quantity * item.price), 450, y, { align: 'right' });

        doc.moveTo(70, y + 15).lineTo(550, y + 15).stroke(); // Horizontal line under each item
        y += 20; // Move down after each item
      }

      // Function to draw expense details
      function drawSubTotal(calculatedAmount) {
        doc
          .fontSize(10)
          .text('Sub Total:', 70, y, { bold: true });
        doc
          .fontSize(10)
          .text(formatAmount(calculatedAmount), 450, y, { align: 'right', bold: true });

        doc.moveTo(70, y + 15).lineTo(550, y + 15).stroke(); // Horizontal line under details
        y += 20; // Move down after details
      }

      // Function to draw total amount at the end
      function drawTotalAmount(totalAmount: number) {
        doc.moveDown(2); // Move down for spacing before total
        doc
          .font('Helvetica-Bold')
          .fontSize(12)
          .text('Grand Total Amount:', 70, y, { bold: true });

        // Set font style and align right
        doc.font('Helvetica-Bold').fontSize(12).text(formatAmount(totalAmount), 450, y, { align: 'right' });

        doc.moveTo(70, y + 15).lineTo(550, y + 15).stroke(); // Horizontal line under total
        y += 20; // Move down after total
      }

      // Function to format amount with custom separators
      function formatAmount(amount) {
        // Convert amount to a number if it's not already
        const parsedAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

        // Check if parsedAmount is a valid number
        if (isNaN(parsedAmount)) {
          return ''; // Or handle accordingly if amount is not a valid number
        }

        // Format the number with custom separators
        const parts = parsedAmount.toFixed(2).split('.');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ','); // Insert commas as thousands separators
        return parts.join('.'); // Join with dot separator for decimal
      }

      // Function to format date into dd-mm-yyyy
      function formatDate(date) {
        const d = new Date(date);
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0'); // Months are zero-based
        const year = d.getFullYear();
        return `${day}-${month}-${year}`;
      }
    } catch (error) {
      // Handle specific error and throw HttpException with appropriate status and message
      throw new HttpException('Invalid date range or category', HttpStatus.BAD_REQUEST);
    }
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
