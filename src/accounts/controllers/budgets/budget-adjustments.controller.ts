import { Controller, Param, Body, Post, Patch, Get, UseGuards } from '@nestjs/common';
import { BudgetAdjustmentsService } from 'src/accounts/service/budgets/budget-adjustments.service';
import { CreateBudgetAdjustmentDto } from 'src/accounts/dto/budgets/adjustments/create-budget-adjustment.dto';
import { JwtAuthGuard } from 'src/authentication/guards/jwt-auth.guard';
import { ApproveOrderDto } from 'src/accounts/dto/budgets/approve-purchase-order.dto';

@Controller('budget-adjustments')
@UseGuards(JwtAuthGuard)
export class BudgetAdjustmentsController {
  constructor(
    private readonly budgetAdjustmentsService: BudgetAdjustmentsService,
  ) {}

  // ***************************************************************************************************
  // Create a new budget-adjustment
  // ***************************************************************************************************
  @Post()
  async create(
    @Body() createBudgetAdjustmentDto: CreateBudgetAdjustmentDto,
  ): Promise<{ message: string }> {
    return this.budgetAdjustmentsService.create(createBudgetAdjustmentDto);
  }

  // ***************************************************************************************************
  // Retrieve a specific budget-adjustment by its ID (UUID or other identifier)
  // ***************************************************************************************************
  @Get(':uuid')
  async findOne(@Param('uuid') uuid: string): Promise<any> {
    return this.budgetAdjustmentsService.findOne(uuid);
  }

  // ***************************************************************************************************
  // Approve a budget (if applicable)
  // ***************************************************************************************************
  @Patch(':uuid/approve')
  async approveBudget(
    @Param('uuid') uuid: string,
    @Body() payload: ApproveOrderDto,
  ): Promise<{ message: string }> {
    return await this.budgetAdjustmentsService.approveAdjustment(uuid, payload);
  }
}
