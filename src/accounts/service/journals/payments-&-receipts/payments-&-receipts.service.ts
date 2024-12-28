import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { isUUID } from 'class-validator';
import { PaymentAndReceipt } from 'src/accounts/entities/journals/payments-&-receipts/payment-&-receipt.entity';
import { PaymentAndReceiptItem } from 'src/accounts/entities/journals/payments-&-receipts/payment-&-receipt-item.entity';
import { Account } from 'src/accounts/entities/account.entity';
import { CreatePaymentAndReceiptDto } from 'src/accounts/dto/journals/payments-&-receipts/create-payment-&-receipt.dto';
import { FileType, saveImage } from 'utils/image-media.utils';
import { excludeFields } from 'utils/pagination.utils';
import {
  Transaction,
  TransactionType,
} from 'src/accounts/entities/transaction.entity';
import { Nature } from 'src/accounts/entities/class.entity';

@Injectable()
export class PaymentsAndReceiptsService {
  constructor(
    @InjectRepository(PaymentAndReceipt)
    private readonly paymentsAndReceiptsRepository: Repository<PaymentAndReceipt>,

    @InjectRepository(PaymentAndReceiptItem)
    private readonly paymentAndReceiptItemsRepository: Repository<PaymentAndReceiptItem>,

    @InjectRepository(Account)
    private readonly accountsRepository: Repository<Account>,

    @InjectRepository(Transaction)
    private readonly transactionsRepository: Repository<Transaction>,
  ) {}

  // ***********************************************************************************************************************************************
  async create(
    createPaymentAndReceiptDto: CreatePaymentAndReceiptDto,
  ): Promise<{ message: string }> {
    const {
      accountId,
      receiptItems,
      date,
      type,
      reference,
      totalAmount,
      description,
      attachment,
    } = createPaymentAndReceiptDto;

    // Check for duplicate receipt by reference
    const existingReference = await this.paymentsAndReceiptsRepository.findOne({
      where: { reference },
    });
    if (existingReference) {
      throw new ConflictException(
        `Payment & receipt with reference ${reference} already exists.`,
      );
    }

    // Step 1: Validate the main item existence (new accountId field)
    const mainAccountId = Number(accountId);
    if (!Number.isInteger(mainAccountId)) {
      throw new BadRequestException(`Invalid ID for account: ${accountId}`);
    }

    const mainAccount = await this.accountsRepository.findOne({
      where: { id: mainAccountId },
    });

    if (!mainAccount) {
      throw new NotFoundException(`Account with ID ${mainAccountId} not found`);
    }

    // Step 2: Validate payment & receipt items existence and quantities
    if (!receiptItems || receiptItems.length === 0) {
      throw new BadRequestException('payment & receipt items cannot be empty');
    }

    // Convert payment & receipt account IDs to numbers and collect them in an array
    const accountIds = receiptItems.map((receiptAccount) =>
      Number(receiptAccount.accountId),
    );

    // Step 3: Check if the main item is included in the payment & receipt items
    if (accountIds.includes(mainAccountId)) {
      throw new BadRequestException(
        'Main account cannot be included in payment & receipt items',
      );
    }

    // Check for duplicate accountId values in receiptItems
    const uniqueAccountIds = new Set(accountIds);
    if (uniqueAccountIds.size !== accountIds.length) {
      throw new BadRequestException(
        'Duplicate payment & receipt items are not allowed',
      );
    }

    let calculatedTotalAmount = 0;
    // Validate payment & receipt accounts
    for (const receiptAccount of receiptItems) {
      const receiptAccountId = Number(receiptAccount.accountId);
      if (Number(receiptAccount.amount) < 1) {
        throw new BadRequestException(
          `Amount for payment & receipt item with ID ${receiptAccount.accountId} must be at least 1`,
        );
      }

      if (!Number.isInteger(receiptAccountId)) {
        throw new BadRequestException(
          `Invalid ID for payment & receipt account: ${receiptAccount.accountId}`,
        );
      }

      const existingItem = await this.accountsRepository.findOne({
        where: { id: receiptAccountId },
      });

      if (!existingItem) {
        throw new NotFoundException(
          `Account with ID ${receiptAccountId} not found`,
        );
      }

      // Check if payment item amount exceeds the available amount in the invoice item
      if (receiptAccount.amount > existingItem.balance) {
        throw new BadRequestException(
          `Amount for payment & receipt item with ID ${receiptAccount.accountId} cannot exceed the available amount of ${existingItem.balance}`,
        );
      }

      calculatedTotalAmount += Number(receiptAccount.amount);
    }

    if (calculatedTotalAmount.toString() !== totalAmount) {
      throw new BadRequestException(
        `The total of payment & receipt items: ${calculatedTotalAmount} does not match the total payment & receipt amount: ${totalAmount}`,
      );
    }

    // Step 4: Generate receipt number
    const receiptCount = await this.paymentsAndReceiptsRepository.count();
    const rcvNumber = `RCV-${(receiptCount + 1).toString().padStart(4, '0')}`;

    // Handle the attachment
    const imageUrl = attachment ? saveImage(attachment,FileType.ATTACHMENT) : null;

    // Step 5: Create receipt with additional fields and main item reference (accountId)
    const receipt = this.paymentsAndReceiptsRepository.create({
      rcvNumber,
      date,
      reference,
      totalAmount,
      type,
      description,
      attachment: imageUrl,
      receiptItems: [], // Initialize with an empty array
      accountId: mainAccountId, // Reference to the main item
    });

    try {
      // Save the receipt
      const savedReceipt =
        await this.paymentsAndReceiptsRepository.save(receipt);

      // Step 6: Create payment & receipt items
      const receiptAccountsEntities = receiptItems.map((receiptAccount) => {
        const receipt_item = new PaymentAndReceiptItem();
        receipt_item.amount = receiptAccount.amount;
        receipt_item.paymentAndReceipt = savedReceipt;
        receipt_item.account = {
          id: Number(receiptAccount.accountId),
        } as Account;
        return receipt_item;
      });

      // Save payment & receipt items
      await this.paymentAndReceiptItemsRepository.save(receiptAccountsEntities);

      return { message: 'Payment & receipt created successfully' };
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException('Payment & receipt already exists');
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

    // Fetch the receipt along with receiptItems
    const receipt = await this.paymentsAndReceiptsRepository.findOne({
      where: { uuid },
      relations: ['receiptItems', 'receiptItems.account', 'account'], // Adjust to correct property names
    });

    if (!receipt) {
      throw new NotFoundException(
        `Payment & receipt with ID ${uuid} not found`,
      );
    }

    // Use the excludeFields utility to exclude `status`
    return excludeFields(receipt, ['status']);
  }

  // ***********************************************************************************************************************************************
  async approvePayment(
    uuid: string,
    payload: { date: Date },
  ): Promise<{ message: string }> {
    if (!isUUID(uuid)) {
      throw new BadRequestException('Invalid UUID format');
    }

    const payment = await this.paymentsAndReceiptsRepository.findOne({
      where: { uuid },
      relations: [
        'receiptItems',
        'receiptItems.account',
        'receiptItems.account.group',
      ], // Load payment items and associated accounts
    });

    if (!payment) {
      throw new NotFoundException(
        `Payment & receipt with ID ${uuid} not found`,
      );
    }

    if (payment.status !== 'Pending') {
      throw new BadRequestException(
        'Only pending payments & receipts can be approved',
      );
    }

    // Check if date is provided in the payload
    if (!payload.date) {
      throw new BadRequestException('Approval date is required');
    }

    // Update the payment status and approvedAt date
    payment.status = 'Approved';
    payment.approvedAt = new Date(payload.date);
    payment.isApproved = true;

    let totalReceiptAmount = 0;

    // Update balances in the account table based on receipt items
    for (const receiptItem of payment.receiptItems) {
      const account = receiptItem.account;

      // Ensure amount is a number
      const amount = Number(receiptItem.amount);
      if (isNaN(amount)) {
        throw new BadRequestException(
          `Invalid amount for receipt item: ${receiptItem.amount}`,
        );
      }

      // Subtract the receipt item amount from the account balance
      account.balance = (Number(account.balance) - amount).toFixed(4); // Ensure proper formatting with two decimal points

      // Accumulate the total amount of all receipt items
      totalReceiptAmount += amount;

      // Save the updated account balance
      await this.accountsRepository.save(account);

      // Create a transaction record for each receipt item's account
      const transactionAccount = this.transactionsRepository.create({
        date: payment.approvedAt,
        amount: amount.toString(),
        account: account, // Ensure `account` is the correct property
        transactionNature: ['Asset', 'Expense'].includes(account.group.type)
          ? Nature.CREDITOR
          : Nature.DEBITOR,
        type: TransactionType.PAYMENT_RECEIPT_VOUCHER,
        record: payment.rcvNumber,
        createdBy: null, // Replace with the actual user when available
      });
      await this.transactionsRepository.save(transactionAccount);
    }

    // Update the balance of the main account by adding the total receipt amount
    const mainAccount = await this.accountsRepository.findOne({
      where: { id: payment.accountId },
    });

    if (!mainAccount) {
      throw new NotFoundException(
        `Main account with ID ${payment.accountId} not found`,
      );
    }

    // Ensure the main account's balance is properly formatted
    mainAccount.balance = (
      Number(mainAccount.balance) + totalReceiptAmount
    ).toFixed(4); // Ensure proper formatting with two decimal points

    // Create a transaction record for the main account
    const transactionMainAccount = this.transactionsRepository.create({
      date: payment.approvedAt,
      amount: totalReceiptAmount.toString(),
      account: mainAccount, // Ensure `account` is the correct property
      transactionNature: Nature.DEBITOR,
      type: TransactionType.PAYMENT_RECEIPT_VOUCHER,
      record: payment.rcvNumber,
      createdBy: null, // Replace with the actual user when available
    });
    await this.transactionsRepository.save(transactionMainAccount);

    // Save the updated main account balance
    await this.accountsRepository.save(mainAccount);

    // Save the updated payment status
    await this.paymentsAndReceiptsRepository.save(payment);

    return { message: 'Payment & receipt approved successfully' };
  }
}
