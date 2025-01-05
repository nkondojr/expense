import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { isUUID } from 'class-validator';
import { Employee } from '../entities/employees/employees.entity';
import { UpdateBankDto } from 'src/organizations/dto/banks/update-bank.dto';
import { EmployeeBank } from '../entities/employees/banks.entity';
import { CreateEmployeeBankDto } from '../dto/employees/banks/create-bank.dto';

@Injectable()
export class EmployeeBanksService {
  constructor(
    @InjectRepository(EmployeeBank)
    private banksRepository: Repository<EmployeeBank>,

    @InjectRepository(Employee)
    private readonly employeesRepository: Repository<Employee>,
  ) { }

  // **********************************************************************************************************************************************
  async create(createEmployeeBankDto: CreateEmployeeBankDto, user: User): Promise<{ message: string }> {
    const { bankName, accountName, accountNumber, accountBranch, employeeId } = createEmployeeBankDto;

    // Check if a bank with the same account number already exists
    const existingBank = await this.banksRepository.findOne({
      where: { accountNumber },
    });
    if (existingBank) {
      throw new ConflictException(
        `Bank with account number ${accountNumber} already exists.`,
      );
    }

    // Check if the multi-currency exists
    const checkEmployee = await this.employeesRepository
      .createQueryBuilder('employee')
      .select('employee')
      .where('employee.id = :id', { id: employeeId })
      .getOne();

    if (!checkEmployee) {
      throw new BadRequestException(`Employee with ID: ${employeeId} not found`);
    }

    // Create a new Bank entity
    const bank = new EmployeeBank();
    bank.bankName = bankName;
    bank.accountName = accountName;
    bank.accountNumber = accountNumber;
    bank.accountBranch = accountBranch;
    bank.employeeId = employeeId;
    bank.createdBy = user;
    bank.updatedBy = user;

    // Save the new bank entity
    await this.banksRepository.save(bank);

    return { message: 'Bank created successfully' };
  }

  // **********************************************************************************************************************************************
  async findOne(id: string): Promise<EmployeeBank> {
    // Validate UUID format for ID
    if (!isUUID(id)) {
      throw new BadRequestException('Invalid UUID format');
    }

    // Attempt to find the bank by UUID
    const bank = await this.banksRepository.findOne({
      where: { id },
      relations: ['employee'],
    });

    // Throw an error if the bank is not found
    if (!bank) {
      throw new NotFoundException(`Bank with ID ${id} not found`);
    }

    return bank;
  }

  // **********************************************************************************************************************************************
  async update(
    id: string,
    updateBankDto: UpdateBankDto,
    user: User,
  ): Promise<{ message: string }> {
    const { bankName, accountName, accountNumber, accountBranch } =
      updateBankDto;
    // Validate UUID format for ID
    if (!isUUID(id)) {
      throw new BadRequestException('Invalid UUID format');
    }

    // Find the bank to update by UUID
    const bank = await this.banksRepository.findOne({
      where: { id },
      relations: ['reference'],
    });
    if (!bank) {
      throw new NotFoundException(`Bank with ID ${id} not found`);
    }

    // Check if a bank with the same account number exists
    if (accountNumber && accountNumber !== bank.accountNumber) {
      const existingBank = await this.banksRepository.findOne({
        where: { accountNumber },
      });
      if (existingBank) {
        throw new ConflictException(
          `Bank with account number ${accountNumber} already exists.`,
        );
      }
      bank.accountNumber = accountNumber;
    }

    // Update other fields, defaulting to existing values if not provided
    bank.bankName = bankName || bank.bankName;
    bank.accountName = accountName || bank.accountName;
    bank.accountBranch = accountBranch || bank.accountBranch;
    bank.updatedBy = user;

    await this.banksRepository.save(bank);
    return { message: 'Bank updated successfully' };
  }

  // ***********************************************************************************************************************************************
  async toggleBankStatus(id: string): Promise<{ message: string }> {
    // Validate the ID format
    if (!isUUID(id)) {
      throw new BadRequestException('Invalid UUID format');
    }

    const bank = await this.banksRepository.findOne({
      where: { id },
    });

    if (!bank) {
      throw new NotFoundException(`Bank with ID ${id} not found`);
    }

    // If no item has storeQty of 0, toggle the isActive status as normal
    bank.isActive = !bank.isActive;
    await this.banksRepository.save(bank);

    const state = bank.isActive ? 'activated' : 'deactivated';
    return { message: `Bank ${state} successfully` };
  }
}
