import { PartialType } from '@nestjs/mapped-types';
import { CreateWorkHistoryDto } from './create-work-history.dto';

export class UpdateWorkHistoryDto extends PartialType(CreateWorkHistoryDto) {}
