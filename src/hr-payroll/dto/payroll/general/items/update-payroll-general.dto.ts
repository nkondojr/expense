import { PartialType } from '@nestjs/mapped-types';
import { CreatePayrollGeneralDto } from './create-payroll-general.dto';

export class UpdatePayrollGeneralDto extends PartialType(CreatePayrollGeneralDto) {}
