import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Account } from 'src/accounts/entities/account.entity';
import { Budget } from 'src/accounts/entities/budgets/budget.entity';
import {
  BudgetAccount,
  BudgetItem,
} from 'src/accounts/entities/budgets/budget-item.entity';
import { CreateBudgetDto } from 'src/accounts/dto/budgets/create-budget.dto';
import { isUUID } from 'class-validator';
import { FinancialYear } from 'src/organizations/entities/financial-years/financial-year.entity';
import { excludeFields } from 'utils/pagination.utils';
import { AccountType } from 'src/accounts/entities/class.entity';
import { FileType, saveImage } from 'utils/image-media.utils';

@Injectable()
export class BudgetsService {
  constructor(
    @InjectRepository(Budget)
    private readonly budgetsRepository: Repository<Budget>,

    @InjectRepository(BudgetItem)
    private readonly budgetItemsRepository: Repository<BudgetItem>,

    @InjectRepository(Account)
    private readonly accountsRepository: Repository<Account>,

    @InjectRepository(FinancialYear)
    private readonly financialYearsRepository: Repository<FinancialYear>,
  ) {}

  // ***********************************************************************************************************************************************
  async create(createBudgetDto: CreateBudgetDto): Promise<{ message: string }> {
    const {
      financialYearId,
      totalExpenseAmount,
      totalIncomeAmount,
      attachment,
      description,
      expenseAccounts,
      incomeAccounts,
    } = createBudgetDto;

    // Check for duplicate financial year
    const financialYearExistInBudget = await this.budgetsRepository.findOne({
      where: { financialYearId },
    });
    if (financialYearExistInBudget) {
      throw new ConflictException(
        `A Budget for Financial year with ID ${financialYearId} already exists.`,
      );
    }

    // Validate account lists
    if (
      (!expenseAccounts || expenseAccounts.length === 0) &&
      (!incomeAccounts || incomeAccounts.length === 0)
    ) {
      throw new BadRequestException(
        'Expense or income accounts cannot be empty',
      );
    }

    // Validate financial year existence
    const financialYearExists = await this.financialYearsRepository.findOne({
      where: { id: Number(financialYearId) },
    });
    if (!financialYearExists) {
      throw new NotFoundException(
        `Financial year with ID ${financialYearId} not found`,
      );
    }

    let calculatedExpenseAmount = 0;
    let calculatedIncomeAmount = 0;

    // Fetch accounts for validation
    const accountIds = [
      ...expenseAccounts.map((item) => item.accountId),
      ...incomeAccounts.map((item) => item.accountId),
    ];
    const accounts = await this.accountsRepository.find({
      where: { id: In(accountIds) },
      relations: ['group'],
    });
    const accountsMap = Object.fromEntries(
      accounts.map((acc) => [acc.id, acc]),
    );

    // Validate and calculate expense amounts
    for (const item of expenseAccounts) {
      const account = accountsMap[item.accountId];
      if (!account || account.group.type !== AccountType.EXPENSE) {
        throw new BadRequestException(
          `Invalid expense account with ID ${item.accountId}`,
        );
      }
      if (Number(item.amount) < 1) {
        throw new BadRequestException(
          `Amount for account ID ${item.accountId} must be at least 1`,
        );
      }
      calculatedExpenseAmount += Number(item.amount);
    }

    // Validate and calculate income amounts
    for (const item of incomeAccounts) {
      const account = accountsMap[item.accountId];
      if (!account || account.group.type !== AccountType.REVENUE) {
        throw new BadRequestException(
          `Invalid income account with ID ${item.accountId}`,
        );
      }
      if (Number(item.amount) < 1) {
        throw new BadRequestException(
          `Amount for account ID ${item.accountId} must be at least 1`,
        );
      }
      calculatedIncomeAmount += Number(item.amount);
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

    // Generate the Budget Number
    const lastOrder = await this.budgetsRepository
      .createQueryBuilder('budget')
      .orderBy('budget.createdAt', 'DESC')
      .getOne();

    let newBudgetNumber = 'BDG-0001';
    if (lastOrder && lastOrder.bdgNumber) {
      const lastNumber = parseInt(lastOrder.bdgNumber.split('-')[1], 10);
      newBudgetNumber = `BDG-${String(lastNumber + 1).padStart(4, '0')}`;
    }

    // Handle attachment image URL if available
    const imageUrl = attachment ? saveImage(attachment,FileType.ATTACHMENT) : null;

    const budget = this.budgetsRepository.create({
      bdgNumber: newBudgetNumber,
      financialYearId: Number(financialYearId),
      totalExpenseAmount: roundedCalculatedExpenseAmount.toString(),
      totalIncomeAmount: roundedCalculatedIncomeAmount.toString(),
      description,
      attachment: imageUrl,
      status: 'Pending',
    } as Partial<Budget>);

    try {
      const savedBudget = await this.budgetsRepository.save(budget);

      const budgetItemsEntities = [
        ...expenseAccounts.map((item) => {
          const budgetItem = new BudgetItem();
          budgetItem.plannedAmount = item.amount;
          budgetItem.budget = savedBudget;
          budgetItem.account = { id: item.accountId } as Account;
          budgetItem.type = BudgetAccount.EXPENSE;
          return budgetItem;
        }),
        ...incomeAccounts.map((item) => {
          const budgetItem = new BudgetItem();
          budgetItem.plannedAmount = item.amount;
          budgetItem.budget = savedBudget;
          budgetItem.account = { id: item.accountId } as Account;
          budgetItem.type = BudgetAccount.INCOME;
          return budgetItem;
        }),
      ];

      await this.budgetItemsRepository.save(budgetItemsEntities);

      return { message: 'Budget created successfully' };
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException('Budget already exists');
      }
      throw error;
    }
  }

  // ***********************************************************************************************************************************************
  async findOne(uuid: string): Promise<any> {
    if (!isUUID(uuid)) {
      throw new BadRequestException('Invalid ID format');
    }

    // Fetch the Budget along with budgetItems (ensure correct relations)
    const budget = await this.budgetsRepository.findOne({
      where: { uuid },
      relations: [
        'financialYear',
        'budgetItems',
        'budgetItems.account',
        'budgetItems.account.group',
      ],
    });

    if (!budget) {
      throw new NotFoundException(`Budget with ID ${uuid} not found`);
    }

    let varianceByType = null;

    // Calculate variance only if the budget is approved
    if (budget.status === 'Approved') {
      varianceByType = budget.budgetItems.reduce(
        (acc, item) => {
          const actualAmount = Number(item.account?.balance) || 0;
          const variance =
            item.type === BudgetAccount.EXPENSE
              ? Number(item.plannedAmount) - actualAmount // Expense variance: planned - actual
              : Number(item.plannedAmount) - actualAmount; // Income variance: actual - planned

          // Sum up the variance by type
          if (item.type === BudgetAccount.EXPENSE) {
            acc.expenseVariance += variance;
          } else if (item.type === BudgetAccount.INCOME) {
            acc.incomeVariance += variance;
          }
          return acc;
        },
        { expenseVariance: 0, incomeVariance: 0 },
      );
    }

    // Exclude the `status` field using the `excludeFields` utility
    const budgetWithoutStatus = excludeFields(budget, ['status']);

    return {
      ...budgetWithoutStatus,
      varianceByType, // Add grouped variance by type (null if not approved)
    };
  }

  // ***********************************************************************************************************************************************
  async approveBudget(
    uuid: string,
    payload: { date: Date },
  ): Promise<{ message: string }> {
    if (!isUUID(uuid)) {
      throw new BadRequestException('Invalid UUID format');
    }

    const budget = await this.budgetsRepository.findOne({
      where: { uuid },
      relations: [
        'budgetItems',
        'budgetItems.account',
        'budgetItems.account.group',
      ],
    });

    if (!budget) {
      throw new NotFoundException(`Budget with ID ${uuid} not found`);
    }

    if (budget.status !== 'Pending') {
      throw new BadRequestException('Only pending budgets can be approved');
    }

    if (!payload.date) {
      throw new BadRequestException('Approval date is required');
    }

    budget.status = 'Approved';
    budget.approvedAt = new Date(payload.date);
    budget.isApproved = true;
    budget.isAdditional = true;
    await this.budgetsRepository.save(budget);

    return { message: 'Budget approved successfully' };
  }
}
