import { DataSource, Repository } from 'typeorm';
import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { isUUID } from 'class-validator';
import { Account } from 'src/accounts/entities/account.entity';
import { PayrollAccount } from 'src/hr-payroll/entities/payroll/payroll-accounts.entity';
import { IndividualDeduction } from 'src/hr-payroll/entities/payroll/individial-deductions.entity';
import { PayrollIndividual } from 'src/hr-payroll/entities/payroll/payroll-individual.entity';
import { UpdateIndividualDeductionDto } from 'src/hr-payroll/dto/payroll/individual/update-individual.dto';
import { CreateIndividualDeductionDto } from 'src/hr-payroll/dto/payroll/individual/create-individual.dto';
import { Employee } from 'src/hr-payroll/entities/employees/employees.entity';

@Injectable()
export class IndividualDeductionsService {
  constructor(
    @InjectRepository(IndividualDeduction)
    private readonly individualDeductionsRepository: Repository<IndividualDeduction>,

    @InjectRepository(Account)
    private readonly accountsRepository: Repository<Account>,

    @InjectRepository(PayrollIndividual)
    private readonly payrollIndividualsRepository: Repository<PayrollIndividual>,

    @InjectRepository(PayrollAccount)
    private readonly payrollAccountsRepository: Repository<PayrollAccount>,

    @InjectRepository(Employee)
    private readonly employeesRepository: Repository<Employee>,

    private readonly dataSource: DataSource, // Inject DataSource
  ) { }

  // ***********************************************************************************************************************************************
  async getNextItemNumber(categoryType: string): Promise<string> {
    let prefix: string;

    switch (categoryType) {
      case 'Employee Earning':
        prefix = 'EARN';
        break;
      case 'Employee Deduction':
        prefix = 'DED';
        break;
      default:
        throw new BadRequestException('Invalid category type');
    }

    const lastItem = await this.dataSource
      .getRepository(IndividualDeduction)
      .createQueryBuilder('individual')
      .where('individual.number LIKE :prefix', { prefix: `${prefix}%` })
      .orderBy('individual.number', 'DESC')
      .getOne();

    let nextNumber = 1;
    if (lastItem) {
      const lastNumber = parseInt(lastItem.number.replace(prefix + '-', ''), 10);
      nextNumber = lastNumber + 1;
    }

    return `${prefix}-${nextNumber.toString().padStart(3, '0')}`;
  }

  // ***********************************************************************************************************************************************
  async create(createIndividualDeductionDto: CreateIndividualDeductionDto): Promise<{ message: string }> {
    const { name, type, deductionPeriod, effectiveDate, nature, value, calculateFrom, employeeId, payrollAccounts } = createIndividualDeductionDto;

    if (!payrollAccounts || payrollAccounts.length === 0) {
      throw new BadRequestException('Payroll accounts cannot be empty');
    }

    // Check if a individual deduction with the same name exists
    const existingDeduction = await this.individualDeductionsRepository.findOne({ where: { name } });
    if (existingDeduction) {
      throw new BadRequestException(`Individual deduction with name "${name}" already exists.`);
    }

    // Check if the employee exists
    const checkEmployee = await this.employeesRepository.findOne({
      where: { id: employeeId },
    });

    if (!checkEmployee) {
      throw new BadRequestException(`Employee with ID: ${employeeId} not found`);
    }

    if (!checkEmployee.isActive) {
      throw new BadRequestException(`Employee with ID: ${employeeId} not active`);
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
      payrollAccount.type = 'Individual';
      payrollAccount.liabilityAccount = liabilityAccount;
      payrollAccount.expenseAccount = expenseAccount;
      payrollAccountsEntities.push(payrollAccount);
    }

    // Generate the next individual deduction number
    const number = await this.getNextItemNumber(type);

    // Create the individual deduction entity
    const individualDeduction = this.individualDeductionsRepository.create({
      name,
      type,
      effectiveDate,
      deductionPeriod,
      nature,
      value,
      calculateFrom,
      employeeId,
      number,
    });

    try {
      // Save the individual deduction
      const savedIndividual = await this.individualDeductionsRepository.save(individualDeduction);

      // Associate saved individual deduction with payroll accounts and save
      payrollAccountsEntities.forEach((account) => (account.individual = savedIndividual));
      await this.payrollAccountsRepository.save(payrollAccountsEntities);

      return { message: 'Individual deduction created successfully' };
    } catch (error) {
      // Log the error and rethrow for debugging or error handling
      console.error('Error while creating individual deduction:', error);
      throw new InternalServerErrorException('Failed to create individual deduction');
    }
  }

  // ***********************************************************************************************************************************************
  async findOne(id: string): Promise<IndividualDeduction> {
    const individualDeduction = await this.individualDeductionsRepository.findOne({
      where: { id },
      relations: ['payrollAccounts', 'employee', 'employee.user'],
    });

    if (!individualDeduction) {
      throw new NotFoundException(`Individual deduction with ID ${id} not found.`);
    }

    return individualDeduction;
  }

  // ***********************************************************************************************************************************************
  async update(
    id: string,
    updateIndividualDeductionDto: UpdateIndividualDeductionDto
  ): Promise<{ message: string }> {
    const { name, type, deductionPeriod, effectiveDate, nature, value, calculateFrom, employeeId, payrollAccounts } = updateIndividualDeductionDto;

    // Check if the deduction exists
    const existingDeduction = await this.individualDeductionsRepository.findOne({ where: { id } });
    if (!existingDeduction) {
      throw new NotFoundException(`Individual deduction with id "${id}" not found.`);
    }

    // Check if the name is being updated and already exists
    if (name && name !== existingDeduction.name) {
      const nameConflict = await this.individualDeductionsRepository.findOne({ where: { name } });
      if (nameConflict) {
        throw new BadRequestException(`Individual deduction with name "${name}" already exists.`);
      }
    }

    // Check if the employee exists
    const checkEmployee = await this.employeesRepository.findOne({
      where: { id: employeeId },
    });

    if (!checkEmployee) {
      throw new BadRequestException(`Employee with ID: ${employeeId} not found`);
    }

    if (!checkEmployee.isActive) {
      throw new BadRequestException(`Employee with ID: ${employeeId} not active`);
    }

    // Validate and update payroll accounts if provided
    if (payrollAccounts && payrollAccounts.length > 0) {
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
        payrollAccount.type = 'Individual';
        payrollAccount.individual = existingDeduction;
        payrollAccount.liabilityAccount = liabilityAccount;
        payrollAccount.expenseAccount = expenseAccount;
        payrollAccountsEntities.push(payrollAccount);
      }

      // Update payroll accounts by first removing old ones and then saving new ones
      await this.payrollAccountsRepository.delete({ individual: existingDeduction });
      await this.payrollAccountsRepository.save(payrollAccountsEntities);
    }

    // Update the individual deduction entity
    Object.assign(existingDeduction, {
      name,
      type,
      deductionPeriod,
      effectiveDate,
      nature,
      value,
      calculateFrom,
      employeeId,
    });

    await this.individualDeductionsRepository.save(existingDeduction);

    return { message: 'Individual deduction updated successfully' };
  }

  // ***********************************************************************************************************************************************
  async toggleIndividualStatus(id: string): Promise<{ message: string }> {
    // Validate the UUID format
    if (!isUUID(id)) {
      throw new BadRequestException('Invalid UUID format');
    }

    const individual = await this.individualDeductionsRepository.findOne({ where: { id } });
    if (!individual) {
      throw new NotFoundException(`Individual deduction with ID ${id} not found`);
    }

    // Toggle the isActive status
    individual.isActive = !individual.isActive;
    await this.individualDeductionsRepository.save(individual);

    const state = individual.isActive ? 'activated' : 'deactivated';
    return { message: `Individual deduction ${state} successfully` };
  }
}
