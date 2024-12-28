import { PartialType } from '@nestjs/mapped-types';
import { CreateJournalEntryItemDto } from './create-journal-entry-item.dto';

export class UpdateJournalEntryItemDto extends PartialType(
  CreateJournalEntryItemDto,
) {}
