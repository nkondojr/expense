import { PartialType } from '@nestjs/mapped-types';
import { CreateHrPayrollDto } from './create-employee.dto';

export class UpdateHrPayrollDto extends PartialType(CreateHrPayrollDto) {}
