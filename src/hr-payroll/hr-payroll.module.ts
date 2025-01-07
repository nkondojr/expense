import { forwardRef, Module } from '@nestjs/common';
import { EmployeesService } from './services/employees/employees.service';
import { EmployeesController } from './controllers/employees/employees.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthenticationModule } from 'src/authentication/authentication.module';
import { Employee } from './entities/employees/employees.entity';
import { Contract } from './entities/employees/contracts.entity';
import { Allocation } from './entities/employees/allocations.entity';
import { NextOfKin } from './entities/employees/next-of-kins.entity';
import { Qualification } from './entities/employees/qualifications.entity';
import { Payroll } from './entities/payroll/payroll.entity';
import { PayrollAccount } from './entities/payroll/payroll-accounts.entity';
import { PayrollGeneral } from './entities/payroll/general-deductions.entity';
import { Individual } from './entities/payroll/individials.entity';
import { PayrollIndividual } from './entities/payroll/individual-deductions.entity';
import { PayrollItem } from './entities/payroll/payroll-items.entity';
import { WorkHistory } from './entities/employees/work-histories.entity';
import { General } from './entities/payroll/generals.entity';
import { EmployeeBank } from './entities/employees/banks.entity';
import { Referee } from './entities/employees/referees.entity';
import { User } from 'src/users/entities/user.entity';
import { EmployeeBanksController } from './controllers/employees/banks.controller';
import { EmployeeBanksService } from './services/employees/banks.service';
import { AllocationsController } from './controllers/employees/allocations.controller';
import { AllocationsService } from './services/employees/allocations.service';
import { ContractsController } from './controllers/employees/contracts.controller';
import { ContractsService } from './services/employees/contracts.service';
import { QualificationsService } from './services/employees/qualifications.service';
import { QualificationsController } from './controllers/employees/qualifications.controller';
import { RefereesController } from './controllers/employees/next-of-kins.controller';
import { RefereesService } from './services/employees/referees.service';
import { WorkHistoryController } from './controllers/employees/work-histories.controller';
import { WorkHistoryService } from './services/employees/work-histories.service';
import { NextOfKinsController } from './controllers/employees/referees.controller copy';
import { NextOfKinsService } from './services/employees/next-of-kins.service';
import { PayrollsService } from './services/payroll/payroll.service';
import { PayrollsController } from './controllers/payroll/payroll.controller';
import { FinancialYear } from 'src/organizations/entities/financial-years/financial-year.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
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
      User,
      FinancialYear,
    ]),
    forwardRef(() => AuthenticationModule), // Import AuthenticationModule
  ],
  controllers: [
    EmployeesController,
    EmployeeBanksController,
    AllocationsController,
    ContractsController,
    QualificationsController,
    RefereesController,
    WorkHistoryController,
    NextOfKinsController,
    PayrollsController,
  ],
  providers: [
    EmployeesService,
    EmployeeBanksService,
    AllocationsService,
    ContractsService,
    QualificationsService,
    RefereesService,
    WorkHistoryService,
    NextOfKinsService,
    PayrollsService,
  ],
})
export class HrPayrollModule {}
