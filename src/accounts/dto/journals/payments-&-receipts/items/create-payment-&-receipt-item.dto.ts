import { IsDecimal, IsNotEmpty, IsNumber } from 'class-validator';

export class CreatePaymentAndReceiptItemDto {
  @IsNumber()
  @IsNotEmpty()
  accountId: number;

  @IsDecimal({ decimal_digits: '0,4' })
  @IsDecimal({ decimal_digits: '0,4' })
  @IsNotEmpty()
  amount: string;
}
