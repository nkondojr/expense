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
  IsInt,
  IsEnum,
  IsDecimal,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreatePaymentAndReceiptItemDto } from './items/create-payment-&-receipt-item.dto';
import { Journal } from 'src/accounts/entities/journals/payments-&-receipts/payment-&-receipt.entity';

export class CreatePaymentAndReceiptDto {
  @IsNotEmpty()
  @IsDateString()
  date: Date;

  @IsDecimal({ decimal_digits: '0,4' })
  @IsOptional()
  totalAmount: string;

  @IsString()
  @IsNotEmpty()
  reference?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  attachment?: string;

  @IsInt()
  @IsNotEmpty()
  accountId: number;

  @IsEnum(Journal)
  @IsNotEmpty()
  readonly type: Journal;

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
  @Type(() => CreatePaymentAndReceiptItemDto)
  @IsNotEmpty()
  receiptItems: CreatePaymentAndReceiptItemDto[];

  status: string; // Add this field
}
