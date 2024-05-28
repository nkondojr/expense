import { PartialType } from '@nestjs/mapped-types';
import { CreateExpenseItemDto } from './create-expense_item.dto';

export class UpdateExpenseItemDto extends PartialType(CreateExpenseItemDto) {}
