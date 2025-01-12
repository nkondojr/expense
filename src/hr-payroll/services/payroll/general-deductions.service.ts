import { DataSource, Repository } from 'typeorm';
import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
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
    let prefix: string;

    switch (categoryType) {
      case 'Employee Earning':
        prefix = 'EARN';
        break;
      case 'Employee Statutory Deduction':
        prefix = 'DED';
        break;
      case 'Employer Statutory Contribution':
        prefix = 'CONTR';
        break;
      default:
        throw new BadRequestException('Invalid category type');
    }

    const lastItem = await this.dataSource
      .getRepository(GeneralDeduction)
      .createQueryBuilder('general')
      .where('general.number LIKE :prefix', { prefix: `${prefix}%` })
      .orderBy('general.number', 'DESC')
      .getOne();

    let nextNumber = 1;
    if (lastItem) {
      const lastNumber = parseInt(lastItem.number.replace(prefix + '-', ''), 10);
      nextNumber = lastNumber + 1;
    }

    return `${prefix}-${nextNumber.toString().padStart(3, '0')}`;
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
      throw new BadRequestException(`General deduction with name "${name}" already exists.`);
    }

    // Validate liability and expense accounts and map payroll accounts
    const payrollAccountsEntities: PayrollAccount[] = [];
    for (const item of payrollAccounts) {
      if (!isUUID(item.liabilityAccountId)) {
        throw new UnprocessableEntityException(`Invalid UUID format for liabilityAccountId: ${item.liabilityAccountId}`);
      }
      if (!isUUID(item.expenseAccountId)) {
        throw new UnprocessableEntityException(`Invalid UUID format for expenseAccountId: ${item.expenseAccountId}`);
      }

      const liabilityAccount = await this.accountsRepository.findOne({ where: { uuid: item.liabilityAccountId } });
      if (!liabilityAccount) {
        throw new NotFoundException(`Liability account with id "${item.liabilityAccountId}" not found`);
      }

      const expenseAccount = await this.accountsRepository.findOne({ where: { uuid: item.expenseAccountId } });
      if (!expenseAccount) {
        throw new NotFoundException(`Expense account with id "${item.expenseAccountId}" not found`);
      }

      const payrollAccount = new PayrollAccount();
      payrollAccount.type = 'General';
      payrollAccount.liabilityAccount = liabilityAccount;
      payrollAccount.expenseAccount = expenseAccount;
      payrollAccountsEntities.push(payrollAccount);
    }

    // Generate the next general deduction number
    const number = await this.getNextItemNumber(type);

    // Create the general deduction entity
    const generalDeduction = this.generalDeductionsRepository.create({
      name,
      type,
      transactionType,
      nature,
      value,
      calculateFrom,
      number,
    });

    try {
      // Save the general deduction
      const savedGeneral = await this.generalDeductionsRepository.save(generalDeduction);

      // Associate saved general deduction with payroll accounts and save
      payrollAccountsEntities.forEach((account) => (account.general = savedGeneral));
      await this.payrollAccountsRepository.save(payrollAccountsEntities);

      return { message: 'General deduction created successfully' };
    } catch (error) {
      // Log the error and rethrow for debugging or error handling
      console.error('Error while creating general deduction:', error);
      throw new InternalServerErrorException('Failed to create general deduction');
    }
  }

  // ***********************************************************************************************************************************************
  async findOne(id: string): Promise<GeneralDeduction> {
    const generalDeduction = await this.generalDeductionsRepository.findOne({
      where: { id },
      relations: ['payrollAccounts'],
    });

    if (!generalDeduction) {
      throw new NotFoundException(`General deduction with ID ${id} not found.`);
    }

    return generalDeduction;
  }
}
