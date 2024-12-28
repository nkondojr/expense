import { PartialType } from '@nestjs/mapped-types';
import { CreateEmployeeBankDto } from './create-bank.dto';

export class UpdateEmployeeBankDto extends PartialType(CreateEmployeeBankDto) {}
