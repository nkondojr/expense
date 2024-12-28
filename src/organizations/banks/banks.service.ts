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
import { Bank } from '../entities/banks/bank.entity';
import { UpdateBankDto } from '../dto/banks/update-bank.dto';
import { Organization } from '../entities/organization.entity';

@Injectable()
export class BanksService {
  constructor(
    @InjectRepository(Bank)
    private bankRepository: Repository<Bank>,

    @InjectRepository(Organization)
    private organizationRepository: Repository<Organization>,
  ) {}

  // **********************************************************************************************************************************************
  async findOne(uuid: string): Promise<Bank> {
    // Validate UUID format for ID
    if (!isUUID(uuid)) {
      throw new BadRequestException('Invalid UUID format');
    }

    // Attempt to find the bank by UUID
    const bank = await this.bankRepository.findOne({
      where: { uuid },
      relations: ['account'],
    });

    // Throw an error if the bank is not found
    if (!bank) {
      throw new NotFoundException(`Bank with ID ${uuid} not found`);
    }

    return bank;
  }

  // **********************************************************************************************************************************************
  async update(
    uuid: string,
    updateBankDto: UpdateBankDto,
    user: User,
  ): Promise<{ message: string }> {
    const { bankName, accountName, accountNumber, accountBranch } =
      updateBankDto;
    // Validate UUID format for ID
    if (!isUUID(uuid)) {
      throw new BadRequestException('Invalid UUID format');
    }

    // Find the bank to update by UUID
    const bank = await this.bankRepository.findOne({
      where: { uuid },
      relations: ['organization'],
    });
    if (!bank) {
      throw new NotFoundException(`Bank with ID ${uuid} not found`);
    }

    // Check if a bank with the same account number exists
    if (accountNumber && accountNumber !== bank.accountNumber) {
      const existingBank = await this.bankRepository.findOne({
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

    await this.bankRepository.save(bank);
    return { message: 'Bank updated successfully' };
  }

  // ***********************************************************************************************************************************************
  async toggleBankStatus(uuid: string): Promise<{ message: string }> {
    // Validate the ID format
    if (!isUUID(uuid)) {
      throw new BadRequestException('Invalid UUID format');
    }

    const bank = await this.bankRepository.findOne({
      where: { uuid },
    });

    if (!bank) {
      throw new NotFoundException(`Bank with ID ${uuid} not found`);
    }

    // If no item has storeQty of 0, toggle the isActive status as normal
    bank.isActive = !bank.isActive;
    await this.bankRepository.save(bank);

    const state = bank.isActive ? 'activated' : 'deactivated';
    return { message: `Bank ${state} successfully` };
  }
}
