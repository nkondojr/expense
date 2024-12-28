import { PartialType } from '@nestjs/mapped-types';
import { CreateAllocationDto } from './create-allcocation.dto';

export class UpdateAllocationDto extends PartialType(CreateAllocationDto) {}
