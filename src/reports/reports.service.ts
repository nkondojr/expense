import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Expense } from 'src/expense/entities/expense.entity';
import { Between, In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { join } from 'path';
import { createWriteStream, existsSync, mkdirSync } from 'fs';
import * as PDFDocument from 'pdfkit';
import * as ExcelJS from 'exceljs';
import { Buffer } from 'buffer';
import { Organization } from 'src/organizations/entities/organization.entity';
import {  } from 'typeorm';
import * as moment from 'moment-timezone';

@Injectable()
export class ReportsService {
    constructor(
        @InjectRepository(Expense)
        private expenseRepository: Repository<Expense>,

        @InjectRepository(Organization)
        private organizationRepository: Repository<Organization>,
    ) { }

    // Ensure the reports directory exists
    // private ensureReportsDirectoryExists() {
    //     const reportsDir = join(__dirname, '..', 'reports');
    //     if (!existsSync(reportsDir)) {
    //         mkdirSync(reportsDir);
    //     }
    // }

    private ensureReportsDirectoryExists() {
        const reportsDir = join(__dirname, '..', '..', 'reports');
        if (!existsSync(reportsDir)) {
            mkdirSync(reportsDir);
        }
    }
    
    

    async generatePdfReport(start_date: string, end_date: string, categoryIds: string[]): Promise<string> {
        this.ensureReportsDirectoryExists();
        try {
            const startDateObj = new Date(start_date);
            const endDateObj = new Date(end_date);

            const query: any = {
                date: Between(startDateObj, endDateObj),
            };
            if (categoryIds && categoryIds.length > 0) {
                query.expenseItems = {
                    product: {
                        category: {
                            id: In(categoryIds),
                        },
                    },
                };
            }

            const expenses = await this.expenseRepository.find({
                where: query,
                relations: ['expenseItems', 'expenseItems.product', 'expenseItems.product.category'],
            });

            const organization = await this.organizationRepository.find();
            const organizationName = organization.length > 0 ? organization[0].name : 'Unknown Organization';

            const doc = new PDFDocument({ layout: 'landscape', margin: 50 });
            // const filePath = join(__dirname, '..', 'reports', 'expense-report.pdf');
            const filePath = join(__dirname, '..', '..', 'reports', 'expense-report.pdf');

            doc.pipe(createWriteStream(filePath));

            // Organization Header
            doc.font('Helvetica-Bold').fontSize(18).fillColor('black').text(organizationName, { align: 'left' });
            doc.fontSize(16).fillColor('black').text('General Expense Report', { align: 'left' }).moveDown();

            const formattedStartDate = formatDate(startDateObj);
            const formattedEndDate = formatDate(endDateObj);

            doc.fontSize(12).text(`From ${formattedStartDate} to ${formattedEndDate}`, {
                align: 'left',
                width: 700,
                continued: false,
            });

            drawTableHeader();

            if (expenses.length === 0) {
                doc.fontSize(12).fillColor('black').text('No data found', 50, doc.y + 0);
                doc.moveTo(50, doc.y + 5).lineTo(750, doc.y + 5).stroke();
            } else {
                let totalAmount = 0;

                expenses.forEach(expense => {
                    const calculatedAmount = expense.expenseItems.reduce((sum, item) => sum + item.quantity * item.price, 0);
                    totalAmount += calculatedAmount;

                    drawExpenseDetails(expense);

                    expense.expenseItems.forEach((item, index) => {
                        drawExpenseItem(item, index + 1);
                    });

                    drawSubTotal(calculatedAmount);
                });

                drawTotalAmount(totalAmount);
            }

            doc.end();

            return filePath;

            function drawTableHeader() {
                let y = doc.y + 20;
                doc.moveTo(50, y + 15).lineTo(750, y + 15).stroke();
                y += 17;

                doc.rect(50, y, 700, 20).fill('#e0e0e0');
                y += 7;

                doc
                    .fontSize(12)
                    .fillColor('#000000')
                    .text('Date / Category', 52, y, { bold: true })
                    .text('Product', 300, y, { bold: true })
                    .text('Qty', 430, y, { bold: true })
                    .text('Unit', 480, y, { bold: true })
                    .text('Price (TSH)', 550, y, { bold: true })
                    .text('Amount (TSH)', 650, y, { align: 'right', bold: true });

                doc.moveTo(50, y + 15).lineTo(750, y + 15).stroke();
                doc.y += 20;
            }

            function drawExpenseDetails(expense) {
                let y = doc.y;
                if (y + 20 > doc.page.height - doc.page.margins.bottom) {
                    doc.addPage();
                    drawTableHeader();
                    y = doc.y;
                }
                doc.fontSize(10).text(formatDate(expense.date), 50, y);
                doc.moveTo(50, y + 15).lineTo(750, y + 15).stroke();
                doc.y += 10;
            }

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
                    .text(item.quantity.toString(), 430, y)
                    .text(item.product.unit, 480, y)
                    .text(formatAmount(item.price), 550, y)
                    .text(formatAmount(item.quantity * item.price), 650, y, { align: 'right' });

                doc.moveTo(50, y + 15).lineTo(750, y + 15).stroke();
                doc.y += 10;
            }

            function drawSubTotal(calculatedAmount) {
                let y = doc.y;
                if (y + 20 > doc.page.height - doc.page.margins.bottom) {
                    doc.addPage();
                    drawTableHeader();
                    y = doc.y;
                }
                doc.fontSize(10).text('Sub Total:', 50, y, { bold: true });
                doc.fontSize(10).text(formatAmount(calculatedAmount), 450, y, { align: 'right', bold: true });

                doc.moveTo(50, y + 15).lineTo(750, y + 15).stroke();
                doc.y += 20;
            }

            function drawTotalAmount(totalAmount: number) {
                let y = doc.y;
                doc.moveDown(2);
                doc.font('Helvetica-Bold').fontSize(12).text('Grand Total Amount:', 50, y, { bold: true });
                doc.font('Helvetica-Bold').fontSize(12).text(formatAmount(totalAmount), 450, y, { align: 'right' });
                doc.moveTo(50, y + 15).lineTo(750, y + 15).stroke();
                doc.y += 20;
            }

            function formatAmount(amount) {
                const parsedAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
                if (isNaN(parsedAmount)) {
                    return '';
                }
                const parts = parsedAmount.toFixed(2).split('.');
                parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                return parts.join('.');
            }

            function formatDate(date) {
                const d = new Date(date);
                const day = String(d.getDate()).padStart(2, '0');
                const month = String(d.getMonth() + 1).padStart(2, '0');
                const year = d.getFullYear();
                return `${day}-${month}-${year}`;
            }
        } catch (error) {
            throw new HttpException('Invalid date range or categories', HttpStatus.BAD_REQUEST);
        }
    }

    async generateExcel(): Promise<Buffer> {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('EXPENSES');

        const headerRow = worksheet.addRow(['DATE', 'PRODUCT', 'QUANTITY', 'UNIT', 'PRICE', 'AMOUNT']);

        headerRow.eachCell((cell) => {
            cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FF808080' },
            };
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
        });

        const expenses = await this.expenseRepository.find({
            relations: ['expenseItems', 'expenseItems.product'],
        });

        let lastDate = '';

        expenses.forEach(expense => {
            const date = new Date(expense.date);
            const formattedDate = !isNaN(date.getTime()) ? date.toISOString().slice(0, 10) : 'Invalid Date';

            if (formattedDate !== lastDate) {
                if (lastDate) {
                    worksheet.addRow([]);
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
                    item.product.unit,
                    item.price,
                    item.quantity * item.price
                ]);

                // row.getCell(5).alignment = { horizontal: 'right' };
                // row.getCell(5).numFmt = '#,##0.00';
                row.getCell(5).alignment = { horizontal: 'right' };
                row.getCell(5).numFmt = '#,##0.00';
                row.getCell(6).alignment = { horizontal: 'right' };
                row.getCell(6).numFmt = '#,##0.00';
            });
        });

        worksheet.getColumn(1).width = 15;
        worksheet.getColumn(2).width = 20;
        worksheet.getColumn(3).width = 25;
        worksheet.getColumn(4).width = 15;
        worksheet.getColumn(5).width = 15;
        worksheet.getColumn(6).width = 20;

        const buffer: Buffer = await workbook.xlsx.writeBuffer() as Buffer;

        return buffer;
    }

    async getDashboardData(): Promise<any> {
        console.log('Fetching dashboard data with monthly breakdown');
        
        // Get the current time in your local time zone (laptop PC time zone)
        const timezone = moment.tz.guess();  // Detects the local time zone
        const now = moment().tz(timezone);
        
        // Define the start and end of today in the local time zone
        const startOfToday = now.clone().startOf('day').toDate();
        const endOfToday = now.clone().endOf('day').toDate();
        
        console.log('Timezone:', timezone);
        console.log('Start of Today:', startOfToday);
        console.log('End of Today:', endOfToday);
        
        // Query to fetch expenses for today
        const todayQuery: any = {
            date: Between(startOfToday, endOfToday),
        };
        
        try {
            // Fetch today's expenses
            const todayExpenses = await this.expenseRepository.find({
                where: todayQuery,
                relations: ['expenseItems', 'expenseItems.product', 'expenseItems.product.category'],
            });
        
            console.log('Today Expenses:', todayExpenses);
        
            let totalTodayAmount = 0;
            const monthlyData = {};
            const categoryTotals = {};
        
            todayExpenses.forEach(expense => {
                const calculatedAmount = expense.expenseItems.reduce((sum, item) => sum + item.quantity * item.price, 0);
                totalTodayAmount += calculatedAmount;
            });
        
            // Fetch all expenses for the graph and category totals
            const allExpenses = await this.expenseRepository.find({
                relations: ['expenseItems', 'expenseItems.product', 'expenseItems.product.category'],
            });
        
            let totalAmount = 0;
        
            allExpenses.forEach(expense => {
                const expenseMonth = moment(expense.date).tz(timezone).format('MMMM YYYY');
                const calculatedAmount = expense.expenseItems.reduce((sum, item) => sum + item.quantity * item.price, 0);
                totalAmount += calculatedAmount;
        
                if (!monthlyData[expenseMonth]) {
                    monthlyData[expenseMonth] = 0;
                }
                monthlyData[expenseMonth] += calculatedAmount;
        
                // Update category totals
                expense.expenseItems.forEach(item => {
                    const categoryName = item.product.category.name;
                    if (!categoryTotals[categoryName]) {
                        categoryTotals[categoryName] = 0;
                    }
                    categoryTotals[categoryName] += item.quantity * item.price;
                });
            });
        
            return {
                totalAmount,
                totalTodayAmount,
                monthlyData,
                categoryTotals,  // Total amount for each category across all expenses
            };
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            throw new HttpException('Error fetching dashboard data', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
}
