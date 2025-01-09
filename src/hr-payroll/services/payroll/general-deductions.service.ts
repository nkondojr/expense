// GeneralDeductionsService
import { DataSource, Repository } from 'typeorm';
import { BadRequestException, Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { GeneralDeduction } from 'src/hr-payroll/entities/payroll/general-deductions.entity';
import { CreateGeneralDeductionDto } from 'src/hr-payroll/dto/payroll/general/create-general.dto';
import { isUUID } from 'class-validator';
import { Account } from 'src/accounts/entities/account.entity';
import { PayrollGeneral } from 'src/hr-payroll/entities/payroll/payroll-general.entity';
import { PayrollAccount } from 'src/hr-payroll/entities/payroll/payroll-accounts.entity';

@Injectable()
export class GeneralDeductionsService {
  constructor(
    @InjectRepository(GeneralDeduction)
    private readonly generalDeductionsRepository: Repository<GeneralDeduction>,

    @InjectRepository(Account)
    private readonly accountsRepository: Repository<Account>,

    @InjectRepository(PayrollGeneral)
    private readonly payrollGeneralsRepository: Repository<PayrollGeneral>,

    @InjectRepository(PayrollAccount)
    private readonly payrollAccountsRepository: Repository<PayrollAccount>,

    private readonly dataSource: DataSource, // Inject DataSource
  ) { }

  // ***********************************************************************************************************************************************
  async getNextItemNumber(categoryType: string): Promise<string> {
    const prefix = categoryType.toUpperCase();

    const lastItem = await this.dataSource
      .getRepository(GeneralDeduction)
      .createQueryBuilder('general')
      .where('general.number LIKE :prefix', { prefix: `${prefix}%` })
      .orderBy('general.number', 'DESC')
      .getOne();

    let nextNumber = 1;
    if (lastItem) {
      const lastNumber = parseInt(lastItem.number.replace(prefix, ''), 10);
      nextNumber = lastNumber + 1;
    }

    return `${prefix}${nextNumber.toString().padStart(4, '0')}`;
  }

  // ***********************************************************************************************************************************************
  async create(createGeneralDeductionDto: CreateGeneralDeductionDto): Promise<{ message: string }> {
    const { name, type, transactionType, nature, value, calculateFrom, payrollAccounts } = createGeneralDeductionDto;

    if (!payrollAccounts || payrollAccounts.length === 0) {
      throw new BadRequestException('Payroll accounts cannot be empty');
    }

    // Check if a general deduction with the same name exists
    const existingDeduction = await this.generalDeductionsRepository.findOne({ where: { name } });

    if (existingDeduction) {
      throw new BadRequestException(`General deduction with name ${name} already exists.`);
    }

    const invalidUUIDs = payrollAccounts.filter((item) => !isUUID(item.liabilityAccountId));
    if (invalidUUIDs.length > 0) {
      throw new UnprocessableEntityException(
        `Invalid ID format for account IDs: ${invalidUUIDs.map((item) => item.liabilityAccountId).join(', ')}`,
      );
    }

    // Validate account existence for each general item
    for (const item of payrollAccounts) {
      const account = await this.accountsRepository.findOne({
        where: { uuid: item.liabilityAccountId },
      });
      if (!account) {
        throw new NotFoundException(
          `Liability account with id ${item.liabilityAccountId} not found`,
        );
      }
    }

    const invalidUUIDss = payrollAccounts.filter((item) => !isUUID(item.expenseAccountId));
    if (invalidUUIDss.length > 0) {
      throw new UnprocessableEntityException(
        `Invalid ID format for account IDs: ${invalidUUIDss.map((item) => item.expenseAccountId).join(', ')}`,
      );
    }

    // Validate account existence for each general item
    for (const item of payrollAccounts) {
      const account = await this.accountsRepository.findOne({
        where: { uuid: item.expenseAccountId },
      });
      if (!account) {
        throw new NotFoundException(
          `Expense account with id ${item.expenseAccountId} not found`,
        );
      }
    }

    const number = await this.getNextItemNumber(type);

    const generalDeduction = this.generalDeductionsRepository.create({
      name,
      type,
      transactionType,
      nature,
      value,
      calculateFrom,
      number,
    });

    // Save the general
    const savedGeneral = await this.generalDeductionsRepository.save(generalDeduction);

    const payrollGenerals = [];

    // Create general items
    const payrollGeneralsEntities = payrollGenerals.map((item) => {
      const payrollGeneral = new PayrollGeneral();
      payrollGeneral.amount = value;
      payrollGeneral.general = savedGeneral;
      return payrollGeneral;
    });

    // Save general items
    await this.payrollGeneralsRepository.save(payrollGeneralsEntities);

    // Create general items
    const payrollAccountsEntities = payrollAccounts.map((item) => {
      const payrollAccount = new PayrollAccount();
      payrollAccount.type = 'General';
      payrollAccount.general = savedGeneral;
      payrollAccount.liabilityAccount = { uuid: item.liabilityAccountId } as any; // Assuming product entity is referenced by ID
      payrollAccount.expenseAccount = { uuid: item.expenseAccountId } as any; // Assuming product entity is referenced by ID
      return payrollAccount;
    });

    // Save general items
    await this.payrollAccountsRepository.save(payrollAccountsEntities);

    return { message: 'General deduction created successfully' };
  }

  // ***********************************************************************************************************************************************
  async findOne(id: string): Promise<GeneralDeduction> {
    const generalDeduction = await this.generalDeductionsRepository.findOne({ where: { id } });

    if (!generalDeduction) {
      throw new NotFoundException(`General deduction with ID ${id} not found.`);
    }

    return generalDeduction;
  }
}
