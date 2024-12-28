import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { isUUID } from 'class-validator';
import { Account } from 'src/accounts/entities/account.entity';
import { FileType, saveImage } from 'utils/image-media.utils';
import { JournalEntry } from 'src/accounts/entities/journals/journal-entries/journal-entry.entity';
import { JournalEntryItem } from 'src/accounts/entities/journals/journal-entries/journal-entry-item.entity';
import { CreateJournalEntryDto } from 'src/accounts/dto/journals/journal-entries/create-journal-entry.dto';
import { excludeFields } from 'utils/pagination.utils';
import {
  Transaction,
  TransactionType,
} from 'src/accounts/entities/transaction.entity';
import { Nature } from 'src/accounts/entities/class.entity';

@Injectable()
export class JournalEntriesService {
  constructor(
    @InjectRepository(JournalEntry)
    private readonly journalEntriesRepository: Repository<JournalEntry>,

    @InjectRepository(JournalEntryItem)
    private readonly journalEntryItemsRepository: Repository<JournalEntryItem>,

    @InjectRepository(Account)
    private readonly accountsRepository: Repository<Account>,

    @InjectRepository(Transaction)
    private readonly transactionsRepository: Repository<Transaction>,
  ) {}

  // ***********************************************************************************************************************************************
  async create(
    createJournalEntryDto: CreateJournalEntryDto,
  ): Promise<{ message: string }> {
    const { date, comment, totalAmount, attachment, jeItems } =
      createJournalEntryDto;

    if (!jeItems || jeItems.length === 0) {
      throw new BadRequestException('Journal entry items cannot be empty');
    }

    let calculatedTotalAmount = 0;

    // Fetch all required accounts beforehand to avoid multiple queries
    const accountIds = jeItems.flatMap((item) => [
      item.creditAccountId,
      item.debtAccountId,
    ]);

    const accounts = await this.accountsRepository.find({
      where: { id: In(accountIds) },
      relations: ['group'],
    });

    const accountsMap = Object.fromEntries(
      accounts.map((acc) => [acc.id, acc]),
    );

    for (const item of jeItems) {
      if (item.creditAccountId === item.debtAccountId) {
        throw new BadRequestException(
          `The credit and debit accounts cannot be the same for item with account ID ${item.creditAccountId}`,
        );
      }

      if (
        !Number.isInteger(item.creditAccountId) ||
        !Number.isInteger(item.debtAccountId)
      ) {
        throw new BadRequestException(
          `Invalid account ID in journal entry items: creditAccountId ${item.creditAccountId}, debtAccountId ${item.debtAccountId}`,
        );
      }

      if (Number(item.amount) < 1) {
        throw new BadRequestException(
          `Amount for journal entry item with ID ${item.creditAccountId} and ${item.debtAccountId} must be at least 1`,
        );
      }

      const creditAccount = accountsMap[item.creditAccountId];
      const debtAccount = accountsMap[item.debtAccountId];

      if (!creditAccount || !debtAccount) {
        throw new NotFoundException(
          `One or more accounts in journal entry items not found: creditAccountId ${item.creditAccountId}, debtAccountId ${item.debtAccountId}`,
        );
      }

      if (!creditAccount.group || !debtAccount.group) {
        throw new BadRequestException(
          `Account group information is missing for creditAccountId ${item.creditAccountId} or debtAccountId ${item.debtAccountId}`,
        );
      }

      const creditBalance = Number(creditAccount.balance) || 0;
      const debtBalance = Number(debtAccount.balance) || 0;
      const itemAmount = Number(item.amount);

      if (
        ['Asset', 'Expense'].includes(creditAccount.group.type) &&
        creditBalance < itemAmount
      ) {
        throw new BadRequestException(
          `Insufficient credit balance in account ID ${item.creditAccountId}, available balance: ${creditAccount.balance}`,
        );
      }

      if (
        ['Liability', 'Equity', 'Revenue'].includes(debtAccount.group.type) &&
        debtBalance < itemAmount
      ) {
        throw new BadRequestException(
          `Insufficient debt balance in account ID ${item.debtAccountId}, available balance: ${debtAccount.balance}`,
        );
      }

      calculatedTotalAmount += itemAmount;
    }

    // Fix floating-point issues with rounding
    const roundedCalculatedTotalAmount = Number(
      calculatedTotalAmount.toFixed(2),
    );
    const roundedTotalAmount = Number(Number(totalAmount).toFixed(2));

    if (roundedCalculatedTotalAmount !== roundedTotalAmount) {
      throw new BadRequestException(
        `The total of journal entry items ${roundedCalculatedTotalAmount} does not match the provided total amount ${roundedTotalAmount}`,
      );
    }

    // Generate receipt number
    const entryCount = await this.journalEntriesRepository.count();
    const jeNumber = `JE-${(entryCount + 1).toString().padStart(4, '0')}`;

    const imageUrl = attachment ? saveImage(attachment,FileType.ATTACHMENT) : null;

    const journalEntry = this.journalEntriesRepository.create({
      jeNumber,
      date,
      comment,
      totalAmount: roundedTotalAmount.toString(),
      attachment: imageUrl,
      jeItems: [],
    });

    try {
      const savedJournalEntry =
        await this.journalEntriesRepository.save(journalEntry);

      const journalEntryItemsEntities = jeItems.map((item) => {
        const journalEntryItem = new JournalEntryItem();
        journalEntryItem.amount = item.amount;
        journalEntryItem.journalEntry = savedJournalEntry;
        journalEntryItem.creditAccount = {
          id: item.creditAccountId,
        } as Account;
        journalEntryItem.debtAccount = { id: item.debtAccountId } as Account;
        return journalEntryItem;
      });

      await this.journalEntryItemsRepository.save(journalEntryItemsEntities);

      return { message: 'Journal entry created successfully' };
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException('Journal entry already exists');
      }
      throw error;
    }
  }

  // ***********************************************************************************************************************************************
  async findOne(uuid: string): Promise<any> {
    if (!isUUID(uuid)) {
      throw new BadRequestException('Invalid ID format');
    }

    // Fetch the journal entry along with jeItems (ensure correct relations)
    const je = await this.journalEntriesRepository.findOne({
      where: { uuid },
      relations: ['jeItems', 'jeItems.creditAccount', 'jeItems.debtAccount'], // Adjust to correct property names
    });

    if (!je) {
      throw new NotFoundException(`Journal entry with ID ${uuid} not found`);
    }

    // Use the excludeFields utility to exclude `status`
    return excludeFields(je, ['status']);
  }

  // ***********************************************************************************************************************************************
  async approveJournal(
    uuid: string,
    payload: { date: Date },
  ): Promise<{ message: string }> {
    if (!isUUID(uuid)) {
      throw new BadRequestException('Invalid UUID format');
    }

    const journal = await this.journalEntriesRepository.findOne({
      where: { uuid },
      relations: [
        'jeItems',
        'jeItems.creditAccount',
        'jeItems.creditAccount.group',
        'jeItems.debtAccount',
        'jeItems.debtAccount.group',
      ],
    });

    if (!journal) {
      throw new NotFoundException(`Journal entry with ID ${uuid} not found`);
    }

    if (journal.status !== 'Pending') {
      throw new BadRequestException(
        'Only pending journal entries can be approved',
      );
    }

    if (!payload.date) {
      throw new BadRequestException('Approval date is required');
    }

    // Approve the journal entry
    journal.status = 'Approved';
    journal.approvedAt = new Date(payload.date);
    journal.isApproved = true;

    await this.journalEntriesRepository.save(journal);

    // Update account balances and create transactions after approval
    for (const item of journal.jeItems) {
      const creditAccount = await this.accountsRepository.findOne({
        where: { id: item.creditAccount.id },
        relations: ['group'],
      });
      const debtAccount = await this.accountsRepository.findOne({
        where: { id: item.debtAccount.id },
        relations: ['group'],
      });

      if (!creditAccount || !debtAccount) {
        throw new NotFoundException(
          `Account not found for item with credit account ID ${item.creditAccount.id} or debt account ID ${item.debtAccount.id}`,
        );
      }

      if (!creditAccount.group || !debtAccount.group) {
        throw new BadRequestException('Account group information is missing');
      }

      const creditBalance = Number(creditAccount.balance) || 0;
      const debtBalance = Number(debtAccount.balance) || 0;
      const itemAmount = Number(item.amount);

      // Update credit account balance
      if (
        ['Liability', 'Equity', 'Revenue'].includes(creditAccount.group.type)
      ) {
        creditAccount.balance = (creditBalance + itemAmount).toFixed(4);
      } else {
        creditAccount.balance = (creditBalance - itemAmount).toFixed(4);
      }

      // Update debt account balance
      if (['Asset', 'Expense'].includes(debtAccount.group.type)) {
        debtAccount.balance = (debtBalance + itemAmount).toFixed(4);
      } else {
        debtAccount.balance = (debtBalance - itemAmount).toFixed(4);
      }

      // Save updated account balances
      await this.accountsRepository.save([creditAccount, debtAccount]);

      // Create transaction for credit account
      const creditTransaction = this.transactionsRepository.create({
        date: journal.approvedAt,
        amount: itemAmount.toString(),
        account: creditAccount,
        transactionNature: Nature.CREDITOR,
        type: TransactionType.JOURNAL_ENTRY,
        record: journal.jeNumber,
        createdBy: null, // Replace with the actual user when available
      });
      await this.transactionsRepository.save(creditTransaction);

      // Create transaction for debt account
      const debtTransaction = this.transactionsRepository.create({
        date: journal.approvedAt,
        amount: itemAmount.toString(),
        account: debtAccount,
        transactionNature: Nature.DEBITOR,
        type: TransactionType.JOURNAL_ENTRY,
        record: journal.jeNumber,
        createdBy: null, // Replace with the actual user when available
      });
      await this.transactionsRepository.save(debtTransaction);
    }

    return {
      message: 'Journal entry approved successfully',
    };
  }
}
