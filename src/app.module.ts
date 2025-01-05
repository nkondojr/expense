import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthenticationModule } from './authentication/authentication.module';
import { CategoriesModule } from './categories/categories.module';
import { ProductsModule } from './products/products.module';
import { User } from './users/entities/user.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ConfigurationModule } from 'config/config.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from './categories/entities/category.entity';
import { Product } from './products/entities/product.entity';
import { ExpenseModule } from './expense/expense.module';
import { Expense } from './expense/entities/expense.entity';
import { ExpenseItemsModule } from './expense_items/expense_items.module';
import { ExpenseItem } from './expense_items/entities/expense_item.entity';
import { ReportsModule } from './reports/reports.module';
import { Report } from './reports/entities/report.entity';
import { OrganizationModule } from './organizations/organizations.module'; // Adjust the path if necessary
import { Organization } from './organizations/entities/organization.entity';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { HrPayrollModule } from './hr-payroll/hr-payroll.module';
import { Employee } from './hr-payroll/entities/employees/employees.entity';
import { Contract } from './hr-payroll/entities/employees/contracts.entity';
import { Allocation } from './hr-payroll/entities/employees/allocations.entity';
import { WorkHistory } from './hr-payroll/entities/employees/work-histories.entity';
import { NextOfKin } from './hr-payroll/entities/employees/next-of-kins.entity';
import { Qualification } from './hr-payroll/entities/employees/qualifications.entity';
import { Payroll } from './hr-payroll/entities/payroll/payroll.entity';
import { PayrollItem } from './hr-payroll/entities/payroll/payroll-items.entity';
import { General } from './hr-payroll/entities/payroll/generals.entity';
import { PayrollGeneral } from './hr-payroll/entities/payroll/general-deductions.entity';
import { Individual } from './hr-payroll/entities/payroll/individials.entity';
import { PayrollIndividual } from './hr-payroll/entities/payroll/individual-deductions.entity';
import { PayrollAccount } from './hr-payroll/entities/payroll/payroll-accounts.entity';
import { EmployeeBank } from './hr-payroll/entities/employees/banks.entity';
import { Referee } from './hr-payroll/entities/employees/referees.entity';
import { FinancialYear } from './organizations/entities/financial-years/financial-year.entity';
import { Budget } from './accounts/entities/budgets/budget.entity';
import { Bank } from './organizations/entities/banks/bank.entity';
import { Account } from './accounts/entities/account.entity';
import { Group } from './accounts/entities/group.entity';
import { Class } from './accounts/entities/class.entity';
import { Balance } from './accounts/entities/balance.entity';
import { Transaction } from './accounts/entities/transaction.entity';
import { Staff } from './accounts/entities/staff.entity';
import { JournalEntry } from './accounts/entities/journals/journal-entries/journal-entry.entity';
import { JournalEntryItem } from './accounts/entities/journals/journal-entries/journal-entry-item.entity';
import { BankTransfer } from './accounts/entities/journals/bank-transfers/bank-transfer.entity';
import { PaymentAndReceipt } from './accounts/entities/journals/payments-&-receipts/payment-&-receipt.entity';
import { PaymentAndReceiptItem } from './accounts/entities/journals/payments-&-receipts/payment-&-receipt-item.entity';
import { BudgetItem } from './accounts/entities/budgets/budget-item.entity';
import { BudgetAdjustment } from './accounts/entities/budgets/adjustments/budget-adjustment.entity';
import { BudgetAdjustmentItem } from './accounts/entities/budgets/adjustments/budget-adjustement-item.entity';
import { AccountsModule } from './accounts/accounts.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', 'media', 'uploads'),
      exclude: ['/api/(.*)'],
      serveRoot: '/media/uploads',
    }),

    ConfigurationModule,
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (ConfigService: ConfigService) => ({
        type: 'postgres',
        host: ConfigService.get('DB_HOST'),
        port: +ConfigService.get('DB_PORT'),
        username: ConfigService.get('DB_USERNAME'),
        password: ConfigService.get('DB_PASSWORD'),
        database: ConfigService.get('DB_NAME'),
        entities: [
          User,
          Category,
          Product,
          Expense,
          ExpenseItem,
          Report,
          Organization,
          Employee,
          Contract,
          Allocation,
          EmployeeBank,
          WorkHistory,
          NextOfKin,
          Qualification,
          Referee,
          Payroll,
          PayrollItem,
          General,
          PayrollGeneral,
          Individual,
          PayrollIndividual,
          PayrollAccount,
          FinancialYear,
          //Accounts
          Account,
          Bank,
          Group,
          Class,
          Balance,
          Transaction,

          //Staff
          Staff,

          //Jouurnal Entries
          JournalEntry,
          JournalEntryItem,

          //Bank Transfer
          BankTransfer,

          //Journals (Payment & Receipt)
          PaymentAndReceipt,
          PaymentAndReceiptItem,

          //Budget
          Budget,
          BudgetItem,
          BudgetAdjustment,
          BudgetAdjustmentItem,
        ],
        // entities: [join(process.cwd(), 'dist/**/*.entity.js')],
        // do NOT use synchronize: true in real projects
        synchronize: true,
      }),
    }),
    ConfigModule.forRoot(),
    UsersModule,
    AuthenticationModule,
    CategoriesModule,
    ProductsModule,
    ExpenseModule,
    ExpenseItemsModule,
    ReportsModule,
    OrganizationModule,
    HrPayrollModule,
    AccountsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
