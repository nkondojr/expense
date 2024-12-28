import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsBoolean,
  IsUUID,
  IsDate,
  IsArray,
  ValidateNested,
  IsDateString,
  IsDecimal,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateJournalEntryItemDto } from './items/create-journal-entry-item.dto';

export class CreateJournalEntryDto {
  @IsNotEmpty()
  @IsDateString()
  date: Date;

  @IsDecimal(
    { decimal_digits: '0,4' },
    {
      message:
        'totalAmount must be a valid decimal number with up to 4 decimal places.',
    },
  )
  @IsOptional()
  totalAmount?: string;

  @IsString()
  @IsOptional()
  comment?: string;

  @IsString()
  @IsOptional()
  attachment?: string;

  @IsOptional()
  @IsBoolean()
  isApproved?: boolean;

  @IsUUID()
  @IsOptional()
  approvedBy?: string;

  @IsDate()
  @IsOptional()
  approvedAt?: Date;

  @IsUUID()
  @IsOptional()
  createdBy?: string;

  @IsUUID()
  @IsOptional()
  updatedBy?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateJournalEntryItemDto)
  @IsNotEmpty()
  jeItems: CreateJournalEntryItemDto[];

  status: string; // Add this field
}
