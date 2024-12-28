import { PartialType } from '@nestjs/mapped-types';
import { CreateGeneralDeductionDto } from './create-general.dto';

export class UpdateGeneralDeductionDto extends PartialType(CreateGeneralDeductionDto) {}
