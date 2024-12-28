import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { isUUID } from 'class-validator';
import { Account } from 'src/accounts/entities/account.entity';
import { BankTransfer } from 'src/accounts/entities/journals/bank-transfers/bank-transfer.entity';
import { CreateBankTransferDto } from 'src/accounts/dto/journals/bank-transfers/create-bank-transfer.dto';
import { excludeFields } from 'utils/pagination.utils';
import {
  Transaction,
  TransactionType,
} from 'src/accounts/entities/transaction.entity';
import { Nature } from 'src/accounts/entities/class.entity';
import { FileType, saveImage } from 'utils/image-media.utils';

@Injectable()
export class BankTransfersService {
  constructor(
    @InjectRepository(BankTransfer)
    private readonly bankTransferRepository: Repository<BankTransfer>,

    @InjectRepository(Account)
    private readonly accountsRepository: Repository<Account>,

    @InjectRepository(Transaction)
    private readonly transactionsRepository: Repository<Transaction>,
  ) {}

  // ***********************************************************************************************************************************************
  async create(
    createBankTransferDto: CreateBankTransferDto,
  ): Promise<{ message: string }> {
    const {
      fromAccountId,
      toAccountId,
      date,
      reference,
      amount,
      description,
      attachment,
    } = createBankTransferDto;

    // Check for duplicate transfer by reference
    const existingReference = await this.bankTransferRepository.findOne({
      where: { reference },
    });
    if (existingReference) {
      throw new ConflictException(
        `Bank transfer with reference ${reference} already exists.`,
      );
    }

    // Prevent transferring from and to the same account
    if (fromAccountId === toAccountId) {
      throw new BadRequestException(
        'Bank Transfer from and to the same account is not allowed',
      );
    }

    // Convert fromAccountId and toAccountId to numbers if they are strings
    const fromAccountNumber = Number(fromAccountId);
    const toAccountNumber = Number(toAccountId);

    if (isNaN(fromAccountNumber) || isNaN(toAccountNumber)) {
      throw new BadRequestException(`Invalid IDs for fromAccount or toAccount`);
    }

    const sourceAccount = await this.accountsRepository.findOne({
      where: { id: fromAccountNumber },
    });
    const destinationAccount = await this.accountsRepository.findOne({
      where: { id: toAccountNumber },
    });

    if (!sourceAccount || !destinationAccount) {
      throw new NotFoundException(
        `One or both accounts not found for IDs: fromAccount ${fromAccountNumber}, toAccount ${toAccountNumber}`,
      );
    }

    // Validate sufficient balance in the fromAccount
    if (amount > sourceAccount.balance) {
      throw new BadRequestException(
        `Insufficient balance in account ID ${fromAccountNumber}, the available balance: ${sourceAccount.balance}`,
      );
    }

    // Generate receipt number
    const transferCount = await this.bankTransferRepository.count();
    const cvNumber = `CV-${(transferCount + 1).toString().padStart(4, '0')}`;

    // Handle the attachment
    const imageUrl = attachment ? saveImage(attachment,FileType.ATTACHMENT) : null;

    // Define the transfer data with correct typing
    const transferData: DeepPartial<BankTransfer> = {
      cvNumber,
      date,
      reference,
      amount,
      description,
      attachment: imageUrl,
      fromAccountId: sourceAccount.id,
      toAccountId: destinationAccount.id,
    };

    // Create the transfer record
    const transfer = this.bankTransferRepository.create(transferData);

    try {
      // Save the transfer
      await this.bankTransferRepository.save(transfer);

      return { message: 'Bank transfer created successfully' };
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException('Bank transfer already exists');
      } else {
        throw error;
      }
    }
  }

  // ***********************************************************************************************************************************************
  async findOne(uuid: string): Promise<any> {
    if (!isUUID(uuid)) {
      throw new BadRequestException('Invalid ID format');
    }

    // Fetch the transfer along with transferItems
    const transfer = await this.bankTransferRepository.findOne({
      where: { uuid },
      relations: ['fromAccount', 'toAccount'], // Adjust to correct property names
    });
    if (!transfer) {
      throw new NotFoundException(`Bank transfer with ID ${uuid} not found`);
    }

    // Use the excludeFields utility to exclude `status`
    return excludeFields(transfer, ['status']);
  }

  // ***********************************************************************************************************************************************
  async approveTransfer(
    uuid: string,
    payload: { date: Date },
  ): Promise<{ message: string }> {
    if (!isUUID(uuid)) {
      throw new BadRequestException('Invalid UUID format');
    }

    const transfer = await this.bankTransferRepository.findOne({
      where: { uuid },
    });
    if (!transfer) {
      throw new NotFoundException(`Bank transfer with ID ${uuid} not found`);
    }

    if (transfer.status !== 'Pending') {
      throw new BadRequestException(
        'Only pending bank transfers can be approved',
      );
    }

    if (!payload.date) {
      throw new BadRequestException('Approval date is required');
    }

    transfer.status = 'Approved';
    transfer.approvedAt = new Date(payload.date);
    transfer.isApproved = true;

    const sourceAccount = await this.accountsRepository.findOne({
      where: { id: transfer.fromAccountId },
    });
    const destinationAccount = await this.accountsRepository.findOne({
      where: { id: transfer.toAccountId },
    });

    if (!sourceAccount || !destinationAccount) {
      throw new NotFoundException(
        `One or both accounts not found for IDs: fromAccount ${transfer.fromAccountId}, toAccount ${transfer.toAccountId}`,
      );
    }

    // Update balances in the involved accounts
    sourceAccount.balance = (
      Number(sourceAccount.balance) - Number(transfer.amount)
    ).toFixed(4);
    destinationAccount.balance = (
      Number(destinationAccount.balance) + Number(transfer.amount)
    ).toFixed(4);

    // Create a transaction record for the source account
    const transactionFromAccount = this.transactionsRepository.create({
      date: transfer.approvedAt,
      amount: transfer.amount,
      account: sourceAccount, // Use `account` if it's the correct property
      transactionNature: Nature.CREDITOR,
      type: TransactionType.CONTRA_VOUCHER,
      record: transfer.cvNumber,
      createdBy: null, // Replace with the actual user when available
    });
    await this.transactionsRepository.save(transactionFromAccount);

    // Create a transaction record for the destination account
    const transactionToAccount = this.transactionsRepository.create({
      date: transfer.approvedAt,
      amount: transfer.amount,
      account: destinationAccount, // Use `account` if it's the correct property
      transactionNature: Nature.DEBITOR,
      type: TransactionType.CONTRA_VOUCHER,
      record: transfer.cvNumber,
      createdBy: null, // Replace with the actual user when available
    });
    await this.transactionsRepository.save(transactionToAccount);

    await this.accountsRepository.save(sourceAccount);
    await this.accountsRepository.save(destinationAccount);
    await this.bankTransferRepository.save(transfer);

    return { message: 'Bank transfer approved successfully' };
  }
}
