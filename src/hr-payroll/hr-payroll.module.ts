import { forwardRef, Module } from '@nestjs/common';
import { EmployeeService } from './services/employees.service';
import { EmployeeController } from './controllers/employees.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthenticationModule } from 'src/authentication/authentication.module';
import { Employee } from './entities/employees/employees.entity';
import { EmployeeContract } from './entities/employees/contracts.entity';
import { EmployeeAllocation } from './entities/employees/allocations.entity';
import { EmployeeNextOfKin } from './entities/employees/next-of-kins.entity';
import { EmployeeQualification } from './entities/employees/qualifications.entity';
import { Payroll } from './entities/payroll/payroll.entity';
import { PayrollAccount } from './entities/payroll/payroll-accounts.entity';
import { PayrollGeneral } from './entities/payroll/general-deductions.entity';
import { Individual } from './entities/payroll/individials.entity';
import { PayrollIndividual } from './entities/payroll/individual-deductions.entity';
import { PayrollItem } from './entities/payroll/payroll-items.entity';
import { EmployeeWorkHistory } from './entities/employees/work-histories.entity';
import { General } from './entities/payroll/generals.entity';
import { EmployeeBank } from './entities/employees/banks.entity';
import { EmployeeReferee } from './entities/employees/referees.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
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
      General,
      PayrollGeneral,
      Individual,
      PayrollIndividual,
      PayrollAccount,
    ]),
    forwardRef(() => AuthenticationModule), // Import AuthenticationModule
  ],
  controllers: [EmployeeController],
  providers: [EmployeeService],
})
export class HrPayrollModule {}
