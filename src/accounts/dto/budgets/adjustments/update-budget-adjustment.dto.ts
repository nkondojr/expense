import { PartialType } from '@nestjs/mapped-types';
import { CreateBudgetAdjustmentDto } from './create-budget-adjustment.dto';

export class UpdateBudgetAdjustmentDto extends PartialType(
  CreateBudgetAdjustmentDto,
) {}
