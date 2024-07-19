import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Expense } from 'src/expense/entities/expense.entity';
import { Between, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { join } from 'path';
import { createWriteStream, existsSync, mkdirSync } from 'fs';
import * as PDFDocument from 'pdfkit';
import * as ExcelJS from 'exceljs';
import { Buffer } from 'buffer';

@Injectable()
export class ReportsService {
  @InjectRepository(Expense)
  private expenseRepository: Repository<Expense>

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

      const doc = new PDFDocument({ layout: 'landscape', margin: 50 });
      const filePath = join(__dirname, '..', '..', 'reports', 'expense-report.pdf');
      doc.pipe(createWriteStream(filePath));

      doc.font('Helvetica-Bold').fontSize(18).fillColor('black').text('QELA TECH (T) LTD', { align: 'left' });
      doc.fontSize(16).fillColor('black').text('General Expense Report', { align: 'left' }).moveDown();

      // Format dates for display
      const formattedStartDate = formatDate(startDateObj);
      const formattedEndDate = formatDate(endDateObj);

      // Write date range to the PDF document
      doc.fontSize(12).text(`From ${formattedStartDate} to ${formattedEndDate}`, {
        align: 'left',
        width: 700,
        continued: false,
      });

      // Draw table headers only once
      drawTableHeader();

      if (expenses.length === 0) {
        doc.fontSize(12).fillColor('black').text('No data found', 50, doc.y + 0);
        doc.moveTo(50, doc.y + 5).lineTo(750, doc.y + 5).stroke(); // Horizontal line under headers
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
        });

        // Draw total amount at the end
        drawTotalAmount(totalAmount);
      }

      doc.end();

      return filePath;

      // Function to draw table header
      function drawTableHeader() {
        let y = doc.y;
        doc.moveTo(50, y + 15).lineTo(750, y + 15).stroke(); // Horizontal line under headers
        y += 17; // Move down after headers

        // Draw a gray rectangle as the background for the header
        doc.rect(50, y, 700, 20).fill('#e0e0e0');
        y += 7; // Move down after headers

        doc
          .fontSize(12)
          .fillColor('#000000')
          .text('Date / Category', 52, y, { bold: true })
          .text('Product', 300, y, { bold: true })
          .text('Qty', 450, y, { bold: true })
          .text('Unit', 500, y, { bold: true })
          .text('Price (TSH)', 550, y, { bold: true })
          .text('Amount (TSH)', 650, y, { align: 'right', bold: true });

        doc.moveTo(50, y + 15).lineTo(750, y + 15).stroke(); // Horizontal line under headers
        doc.y += 20; // Move down after headers
      }

      // Function to draw expense details
      function drawExpenseDetails(expense) {
        let y = doc.y;
        if (y + 20 > doc.page.height - doc.page.margins.bottom) {
          doc.addPage();
          drawTableHeader();
          y = doc.y;
        }
        doc
          .fontSize(10)
          .text(formatDate(expense.date), 50, y);

        doc.moveTo(50, y + 15).lineTo(750, y + 15).stroke(); // Horizontal line under details
        doc.y += 10; // Move down after details
      }

      // Function to draw expense item
      function drawExpenseItem(item, index) {
        let y = doc.y;
        if (y + 20 > doc.page.height - doc.page.margins.bottom) {
          doc.addPage();
          drawTableHeader();
          y = doc.y;
        }
        doc
          .fontSize(10)
          .text(index.toString() + ".", 50, y)
          .text(item.product.category.name, 60, y)
          .text(item.product.name, 300, y)
          .text(item.quantity.toString(), 450, y)
          .text(item.product.unit, 500, y)
          .text(formatAmount(item.price), 550, y)
          .text(formatAmount(item.quantity * item.price), 650, y, { align: 'right' });

        doc.moveTo(50, y + 15).lineTo(750, y + 15).stroke(); // Horizontal line under each item
        doc.y += 10; // Move down after each item
      }

      // Function to draw sub total
      function drawSubTotal(calculatedAmount) {
        let y = doc.y;
        if (y + 20 > doc.page.height - doc.page.margins.bottom) {
          doc.addPage();
          drawTableHeader();
          y = doc.y;
        }
        doc
          .fontSize(10)
          .text('Sub Total:', 50, y, { bold: true });
        doc
          .fontSize(10)
          .text(formatAmount(calculatedAmount), 450, y, { align: 'right', bold: true });

        doc.moveTo(50, y + 15).lineTo(750, y + 15).stroke(); // Horizontal line under sub total
        doc.y += 20; // Move down after sub total
      }

      // Function to draw total amount at the end
      function drawTotalAmount(totalAmount: number) {
        let y = doc.y;
        doc.moveDown(2); // Move down for spacing before total
        doc
          .font('Helvetica-Bold')
          .fontSize(12)
          .text('Grand Total Amount:', 50, y, { bold: true });

        // Set font style and align right
        doc.font('Helvetica-Bold').fontSize(12).text(formatAmount(totalAmount), 450, y, { align: 'right' });

        doc.moveTo(50, y + 15).lineTo(750, y + 15).stroke(); // Horizontal line under total
        doc.y += 20; // Move down after total
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
