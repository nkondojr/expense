import { PartialType } from '@nestjs/mapped-types';
import { CreateBankTransferDto } from './create-bank-transfer.dto';

export class UpdateBanktransferDto extends PartialType(CreateBankTransferDto) {}
