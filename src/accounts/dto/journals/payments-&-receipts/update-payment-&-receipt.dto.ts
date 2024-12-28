import { PartialType } from '@nestjs/mapped-types';
import { CreatePaymentAndReceiptDto } from './create-payment-&-receipt.dto';

export class UpdatePaymentAndReceiptDto extends PartialType(
  CreatePaymentAndReceiptDto,
) {}
