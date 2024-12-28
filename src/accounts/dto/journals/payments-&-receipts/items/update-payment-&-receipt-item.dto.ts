import { PartialType } from '@nestjs/mapped-types';
import { CreatePaymentAndReceiptItemDto } from './create-payment-&-receipt-item.dto';

export class UpdatePaymentAndReceiptItemDto extends PartialType(
  CreatePaymentAndReceiptItemDto,
) {}
