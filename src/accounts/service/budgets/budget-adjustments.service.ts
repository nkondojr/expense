import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import {
  BudgetAccount,
  BudgetItem,
} from 'src/accounts/entities/budgets/budget-item.entity';
import { isUUID } from 'class-validator';
import { excludeFields } from 'utils/pagination.utils';
import { BudgetAdjustment } from 'src/accounts/entities/budgets/adjustments/budget-adjustment.entity';
import { BudgetAdjustmentItem } from 'src/accounts/entities/budgets/adjustments/budget-adjustement-item.entity';
import { Budget } from 'src/accounts/entities/budgets/budget.entity';
import { CreateBudgetAdjustmentDto } from 'src/accounts/dto/budgets/adjustments/create-budget-adjustment.dto';
import { Account } from 'src/accounts/entities/account.entity';
import { AccountType } from 'src/accounts/entities/class.entity';
import { FileType, saveImage } from 'utils/image-media.utils';

@Injectable()
export class BudgetAdjustmentsService {
  constructor(
    @InjectRepository(Budget)
    private readonly budgetsRepository: Repository<Budget>,

    @InjectRepository(BudgetItem)
    private readonly budgetItemsRepository: Repository<BudgetItem>,

    @InjectRepository(BudgetAdjustment)
    private readonly budgetAdjustmentsRepository: Repository<BudgetAdjustment>,

    @InjectRepository(BudgetAdjustmentItem)
    private readonly budgetAdjustmentItemsRepository: Repository<BudgetAdjustmentItem>,

    @InjectRepository(Account)
    private readonly accountsRepository: Repository<Account>,
  ) {}

  // ***********************************************************************************************************************************************
  async create(
    createBudgetAdjustmentDto: CreateBudgetAdjustmentDto,
  ): Promise<{ message: string }> {
    const {
      budgetId,
      totalExpenseAmount,
      totalIncomeAmount,
      attachment,
      date,
      description,
      expenseBudgetItems,
      incomeBudgetItems,
    } = createBudgetAdjustmentDto;

    // Validate that at least one adjustment item is provided
    if (
      (!expenseBudgetItems || expenseBudgetItems.length === 0) &&
      (!incomeBudgetItems || incomeBudgetItems.length === 0)
    ) {
      throw new BadRequestException(
        'Expense or income budget items cannot be empty',
      );
    }

    // Validate Financial Year existence
    const budget = await this.budgetsRepository.findOne({
      where: { id: Number(budgetId) },
    });
    if (!budget) {
      throw new NotFoundException(`Budget with ID ${budgetId} not found`);
    }

    if (!budget.isApproved) {
      throw new NotFoundException(`Budget with ID ${budgetId} not approved`);
    }

    let calculatedExpenseAmount = 0;
    let calculatedIncomeAmount = 0;

    // Fetch budget items for validation and calculation
    const budgetItemIds = [
      ...expenseBudgetItems.map((item) => item.budgetItemId),
      ...incomeBudgetItems.map((item) => item.budgetItemId),
    ];
    const budgetItems = await this.budgetItemsRepository.find({
      where: { id: In(budgetItemIds) },
      relations: ['account', 'account.group'],
    });
    const budgetItemsMap = Object.fromEntries(
      budgetItems.map((item) => [item.id, item]),
    );

    // Validate and calculate expense amounts
    for (const item of expenseBudgetItems) {
      const itemRecord = budgetItemsMap[item.budgetItemId];
      const account = itemRecord?.account;

      if (!account || account.group.type !== AccountType.EXPENSE) {
        throw new BadRequestException(
          `Invalid expense account with ID ${item.budgetItemId}`,
        );
      }
      if (Number(item.currentAmount) < 1) {
        throw new BadRequestException(
          `Amount for item ID ${item.budgetItemId} must be at least 1`,
        );
      }
      calculatedExpenseAmount += Number(item.currentAmount); // Convert to number
    }

    // Validate and calculate income amounts
    for (const item of incomeBudgetItems) {
      const itemRecord = budgetItemsMap[item.budgetItemId];
      const account = itemRecord?.account;

      if (!account || account.group.type !== AccountType.REVENUE) {
        throw new BadRequestException(
          `Invalid income account with ID ${item.budgetItemId}`,
        );
      }
      if (Number(item.currentAmount) < 1) {
        throw new BadRequestException(
          `Amount for item ID ${item.budgetItemId} must be at least 1`,
        );
      }
      calculatedIncomeAmount += Number(item.currentAmount); // Convert to number
    }

    // Convert totals to numbers and round to 2 decimal places
    const roundedCalculatedExpenseAmount = Number(
      calculatedExpenseAmount.toFixed(2),
    );
    const roundedCalculatedIncomeAmount = Number(
      calculatedIncomeAmount.toFixed(2),
    );
    const roundedProvidedExpenseAmount = Number(
      Number(totalExpenseAmount).toFixed(2),
    );
    const roundedProvidedIncomeAmount = Number(
      Number(totalIncomeAmount).toFixed(2),
    );

    // Verify total amounts match
    if (
      roundedCalculatedExpenseAmount !== roundedProvidedExpenseAmount ||
      roundedCalculatedIncomeAmount !== roundedProvidedIncomeAmount
    ) {
      throw new BadRequestException(
        `Total amounts for income and expense accounts ${roundedCalculatedIncomeAmount} and ${roundedCalculatedExpenseAmount} do not match provided totals ${roundedProvidedIncomeAmount} and ${roundedProvidedExpenseAmount} respectively`,
      );
    }

    // Handle attachment image URL if provided
    const imageUrl = attachment ? saveImage(attachment,FileType.ATTACHMENT) : null;

    const budgetAdjustment = this.budgetAdjustmentsRepository.create({
      budgetId: Number(budgetId),
      description,
      attachment: imageUrl,
      status: 'Pending',
      date,
      totalExpenseAmount: roundedCalculatedExpenseAmount.toString(),
      totalIncomeAmount: roundedCalculatedIncomeAmount.toString(),
    });

    try {
      const savedAdjustment =
        await this.budgetAdjustmentsRepository.save(budgetAdjustment);

      // Prepare and save adjustment items
      const adjustmentItems = [
        ...expenseBudgetItems.map((item) => {
          const budgetItem = new BudgetAdjustmentItem();
          budgetItem.currentAmount = item.currentAmount;
          budgetItem.previousAmount =
            budgetItemsMap[item.budgetItemId].plannedAmount;
          budgetItem.budgetAdjustment = savedAdjustment;
          budgetItem.comment = item.comment;
          budgetItem.id = item.budgetItemId;
          budgetItem.account = { id: item.budgetItemId } as Account;
          budgetItem.type = BudgetAccount.EXPENSE;
          return budgetItem;
        }),
        ...incomeBudgetItems.map((item) => {
          const budgetItem = new BudgetAdjustmentItem();
          budgetItem.currentAmount = item.currentAmount;
          budgetItem.previousAmount =
            budgetItemsMap[item.budgetItemId].plannedAmount;
          budgetItem.budgetAdjustment = savedAdjustment;
          budgetItem.comment = item.comment;
          budgetItem.id = item.budgetItemId;
          budgetItem.account = { id: item.budgetItemId } as Account;
          budgetItem.type = BudgetAccount.INCOME;
          return budgetItem;
        }),
      ];

      await this.budgetAdjustmentItemsRepository.save(adjustmentItems);

      return { message: 'Budget adjustment created successfully' };
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException('Budget adjustment already exists');
      }
      throw error;
    }
  }

  // ***********************************************************************************************************************************************
  async findOne(uuid: string): Promise<any> {
    if (!isUUID(uuid)) {
      throw new BadRequestException('Invalid ID format');
    }

    // Fetch the Budget Adjustment along with adjusted items
    const adjustment = await this.budgetAdjustmentsRepository.findOne({
      where: { uuid },
      relations: [
        'budget',
        'budget.financialYear',
        'budgetAdjustmentItems',
        'budgetAdjustmentItems.account',
        'budgetAdjustmentItems.account.group',
      ],
    });

    if (!adjustment) {
      throw new NotFoundException(
        `Budget adjustment with ID ${uuid} not found`,
      );
    }

    // Exclude the `status` field using the `excludeFields` utility
    const adjustmentWithoutStatus = excludeFields(adjustment, ['status']);

    return adjustmentWithoutStatus;
  }

  // ***********************************************************************************************************************************************
  async approveAdjustment(
    uuid: string,
    payload: { date: Date },
  ): Promise<{ message: string }> {
    if (!isUUID(uuid)) {
      throw new BadRequestException('Invalid UUID format');
    }

    const adjustment = await this.budgetAdjustmentsRepository.findOne({
      where: { uuid },
      relations: [
        'budgetAdjustmentItems',
        'budgetAdjustmentItems.account',
        'budgetAdjustmentItems.account.group',
      ],
    });

    if (!adjustment) {
      throw new NotFoundException(
        `Budget adjustment with ID ${uuid} not found`,
      );
    }

    if (adjustment.status !== 'Pending') {
      throw new BadRequestException('Only pending adjustments can be approved');
    }

    if (!payload.date) {
      throw new BadRequestException('Approval date is required');
    }

    adjustment.status = 'Approved';
    adjustment.approvedAt = new Date(payload.date);
    adjustment.isApproved = true;
    await this.budgetAdjustmentsRepository.save(adjustment);

    return { message: 'Budget adjustment approved successfully' };
  }
}
