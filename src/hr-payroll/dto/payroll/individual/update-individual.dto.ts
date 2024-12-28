import { PartialType } from '@nestjs/mapped-types';
import { CreateIndividualDeductionDto } from './create-individual.dto';

export class UpdateIndividualDeductionDto extends PartialType(CreateIndividualDeductionDto) {}
