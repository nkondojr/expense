import { PartialType } from '@nestjs/mapped-types';
import { CreatePayrollAccountDto } from './create-payroll-account.dto';

export class UpdatePayrollAccountDto extends PartialType(CreatePayrollAccountDto) {}
