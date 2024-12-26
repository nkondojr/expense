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
import { EmployeeContract } from './hr-payroll/entities/employees/contracts.entity';
import { EmployeeAllocation } from './hr-payroll/entities/employees/allocations.entity';
import { EmployeeWorkHistory } from './hr-payroll/entities/employees/work-histories.entity';
import { EmployeeNextOfKin } from './hr-payroll/entities/employees/next-of-kins.entity';
import { EmployeeQualification } from './hr-payroll/entities/employees/qualifications.entity';
import { Payroll } from './hr-payroll/entities/payroll/payrolls.entity';
import { PayrollItem } from './hr-payroll/entities/payroll/payroll-items.entity';
import { Compensation } from './hr-payroll/entities/payroll/generals.entity';
import { PayrollCompensation } from './hr-payroll/entities/payroll/general-deductions.entity';
import { EmployeeCompensation } from './hr-payroll/entities/payroll/individials.entity';
import { EmployeePayrollCompensation } from './hr-payroll/entities/payroll/individual-deductions.entity';
import { PayrollAccount } from './hr-payroll/entities/payroll/payroll-accounts.entity';
import { EmployeeBank } from './hr-payroll/entities/employees/banks.entity';
import { EmployeeReferee } from './hr-payroll/entities/employees/referees.entity';
import { FinancialYear } from './organizations/entities/financial-years/financial-year.entity';

@Module({
  imports: [
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
          EmployeeContract,
          EmployeeAllocation,
          EmployeeBank,
          EmployeeWorkHistory,
          EmployeeNextOfKin,
          EmployeeQualification,
          EmployeeReferee,
          Payroll,
          PayrollItem,
          Compensation,
          PayrollCompensation,
          EmployeeCompensation,
          EmployeePayrollCompensation,
          PayrollAccount,
          FinancialYear
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
    HrPayrollModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
