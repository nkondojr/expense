import { PartialType } from '@nestjs/mapped-types';
import { CreateBudgetAdjustmentItemDto } from './create-budget-adjustment-item.dto';

export class UpdateBudgetAdjustmentItemDto extends PartialType(
  CreateBudgetAdjustmentItemDto,
) {}
