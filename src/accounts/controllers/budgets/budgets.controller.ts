import { Controller, Param, Body, Post, Patch, Get, UseGuards } from '@nestjs/common';
import { BudgetsService } from 'src/accounts/service/budgets/budgets.service';
import { CreateBudgetDto } from 'src/accounts/dto/budgets/create-budget.dto';
import { JwtAuthGuard } from 'src/authentication/guards/jwt-auth.guard';
import { ApproveOrderDto } from 'src/accounts/dto/budgets/approve-purchase-order.dto';

@Controller('budgets')
@UseGuards(JwtAuthGuard)
export class BudgetsController {
  constructor(private readonly budgetsService: BudgetsService) {}

  // ***************************************************************************************************
  // Create a new budget
  // ***************************************************************************************************
  @Post()
  async create(
    @Body() createBudgetDto: CreateBudgetDto,
  ): Promise<{ message: string }> {
    return this.budgetsService.create(createBudgetDto);
  }

  // ***************************************************************************************************
  // Retrieve a specific budget by its ID (UUID or other identifier)
  // ***************************************************************************************************
  @Get(':uuid')
  async findOne(@Param('uuid') uuid: string): Promise<any> {
    return this.budgetsService.findOne(uuid);
  }

  // ***************************************************************************************************
  // Approve a budget (if applicable)
  // ***************************************************************************************************
  @Patch(':uuid/approve')
  async approveBudget(
    @Param('uuid') uuid: string,
    @Body() payload: ApproveOrderDto,
  ): Promise<{ message: string }> {
    return await this.budgetsService.approveBudget(uuid, payload);
  }
}
