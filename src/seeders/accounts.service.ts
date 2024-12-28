import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  buildPaginationResponse,
  excludeFields,
  paginate,
} from 'utils/pagination.utils';
import { Brackets, Raw, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Account } from '../accounts/entities/account.entity';
import { CreateAccountDto } from '../accounts/dto/accounts/create-account.dto';
import { AccountType, Class } from '../accounts/entities/class.entity';
import { UpdateAccountDto } from '../accounts/dto/accounts/update-account.dto';
import { Balance } from '../accounts/entities/balance.entity';
import { Group, Mode } from '../accounts/entities/group.entity';
import { isUUID, validate } from 'class-validator';
import { Staff } from 'src/accounts/entities/staff.entity';
import { FinancialYear } from 'src/organizations/entities/financial-years/financial-year.entity';
import { PaymentAndReceipt } from 'src/accounts/entities/journals/payments-&-receipts/payment-&-receipt.entity';
import { BankTransfer } from 'src/accounts/entities/journals/bank-transfers/bank-transfer.entity';
import { JournalEntry } from 'src/accounts/entities/journals/journal-entries/journal-entry.entity';
import { Budget } from 'src/accounts/entities/budgets/budget.entity';
import { BudgetAccount } from 'src/accounts/entities/budgets/budget-item.entity';
import { BudgetAdjustment } from 'src/accounts/entities/budgets/adjustments/budget-adjustment.entity';
import { SearchParams } from 'utils/search-parms.util';
import { Bank } from 'src/organizations/entities/banks/bank.entity';
import { CreateBankDto } from 'src/organizations/dto/banks/create-bank.dto';

@Injectable()
export class AccountsService {
  constructor(
    @InjectRepository(Account)
    private readonly accountsRepository: Repository<Account>,

    @InjectRepository(Bank)
    private readonly banksRepository: Repository<Bank>,

    @InjectRepository(Group)
    private readonly groupsRepository: Repository<Group>,

    @InjectRepository(Class)
    private readonly classesRepository: Repository<Class>,

    @InjectRepository(FinancialYear)
    private readonly financialYearsRepository: Repository<FinancialYear>,

    @InjectRepository(Balance)
    private readonly balancesRepository: Repository<Balance>,

    @InjectRepository(Staff)
    private readonly staffsRepository: Repository<Staff>,

    @InjectRepository(PaymentAndReceipt)
    private readonly paymentsAndReceiptsRepository: Repository<PaymentAndReceipt>,

    @InjectRepository(BankTransfer)
    private readonly bankTransfersRepository: Repository<BankTransfer>,

    @InjectRepository(JournalEntry)
    private readonly journalEntriesRepository: Repository<JournalEntry>,

    @InjectRepository(Budget)
    private readonly budgetsRepository: Repository<Budget>,

    @InjectRepository(BudgetAdjustment)
    private readonly budgetAdjustmentsRepository: Repository<BudgetAdjustment>,
  ) { }

  // ***********************************************************************************************************************************************
  async seed() {
    const accounts = [
      {
        id: 1,
        uuid: 'a235d290-f5de-44a9-9fde-9a5d2f92616f',
        code: '100100-001',
        name: 'account receivable collection',
        mode: Mode.COLLECTION, // Correctly use the enum
        isEditable: false,
        group: 1,
        class: 4,
        createdBy: null,
        updatedBy: null,
        createdAt: new Date('2024-05-01T00:00:57.595Z'),
        updatedAt: new Date('2024-05-01T00:00:57.595Z'),
      },
      {
        id: 2,
        uuid: '743d892f-69cc-4955-a6a0-03297fb34603',
        code: '1100-001',
        name: 'pre payment',
        mode: Mode.OPERATION, // Correctly use the enum
        isEditable: false,
        group: 2,
        class: 10,
        createdBy: null,
        updatedBy: null,
        createdAt: new Date('2024-05-01T00:00:58.595Z'),
        updatedAt: new Date('2024-05-01T00:00:58.595Z'),
      },
      {
        id: 3,
        uuid: '03d1e8eb-dca2-4fb1-8b53-17e994810b0d',
        code: '1100-002',
        name: 'account receivable operation',
        mode: Mode.OPERATION, // Correctly use the enum
        isEditable: false,
        group: 2,
        class: 4,
        createdBy: null,
        updatedBy: null,
        createdAt: new Date('2024-05-01T00:00:59.595Z'),
        updatedAt: new Date('2024-05-01T00:00:59.595Z'),
      },
      {
        id: 4,
        uuid: '40b9d49d-8ac2-4fd6-a67d-f269170a11c4',
        code: '1100-003',
        name: 'imprest',
        mode: Mode.OPERATION, // Correctly use the enum
        isEditable: false,
        group: 2,
        class: 10,
        createdBy: null,
        updatedBy: null,
        createdAt: new Date('2024-05-01T00:01:00.595Z'),
        updatedAt: new Date('2024-05-01T00:01:00.595Z'),
      },
      {
        id: 5,
        uuid: 'f4c708e9-6d63-4255-a428-a0562b2029b4',
        code: '2100-001',
        name: 'account payable',
        mode: Mode.OPERATION, // Correctly use the enum
        isEditable: false,
        group: 6,
        class: 14,
        createdBy: null,
        updatedBy: null,
        createdAt: new Date('2024-05-01T00:01:01.595Z'),
        updatedAt: new Date('2024-05-01T00:01:01.595Z'),
      },
      {
        id: 6,
        uuid: '0dc18986-2f87-4dc0-a851-9728ca068221',
        code: '2100-002',
        name: 'customer deposit',
        mode: Mode.OPERATION, // Correctly use the enum
        isEditable: false,
        group: 6,
        class: 11,
        createdBy: null,
        updatedBy: null,
        createdAt: new Date('2024-05-01T00:01:02.595Z'),
        updatedAt: new Date('2024-05-01T00:01:02.595Z'),
      },
      {
        id: 7,
        uuid: '2b49503e-99e7-42fb-ab14-279b4e2c87df',
        code: '2100-003',
        name: 'grir',
        mode: Mode.OPERATION, // Correctly use the enum
        isEditable: false,
        group: 6,
        class: 14,
        createdBy: null,
        updatedBy: null,
        createdAt: new Date('2024-05-01T00:01:03.595Z'),
        updatedAt: new Date('2024-05-01T00:01:03.595Z'),
      },
      {
        id: 8,
        uuid: '728454c7-6e48-41a8-8ef0-ac394b01ef9a',
        code: '3100-001',
        name: 'ordinary share capital',
        mode: Mode.OPERATION, // Correctly use the enum
        isEditable: true,
        group: 7,
        class: 28,
        createdBy: null,
        updatedBy: null,
        createdAt: new Date('2024-05-01T00:01:05.595Z'),
        updatedAt: new Date('2024-05-01T00:01:05.595Z'),
      },
      {
        id: 9,
        uuid: 'afef5b44-fd89-44a0-8715-9864a8f2a2cc',
        code: '3100-002',
        name: 'retained earnings',
        mode: Mode.OPERATION, // Correctly use the enum
        isEditable: true,
        group: 7,
        class: 28,
        createdBy: null,
        updatedBy: null,
        createdAt: new Date('2024-05-01T00:01:05.595Z'),
        updatedAt: new Date('2024-05-01T00:01:05.595Z'),
      },
      {
        id: 10,
        uuid: 'cd75d697-d3c5-4af9-bfd8-405b190abc35',
        code: '4300-001',
        name: 'purchase discount',
        mode: Mode.OPERATION, // Correctly use the enum
        isEditable: false,
        group: 11,
        class: 32,
        createdBy: null,
        updatedBy: null,
        createdAt: new Date('2024-05-01T00:01:06.595Z'),
        updatedAt: new Date('2024-05-01T00:01:06.595Z'),
      },
      {
        id: 11,
        uuid: '2ec987c1-86be-40ef-91a9-b4845daa40a5',
        code: '5200-001',
        name: 'additional cost',
        mode: Mode.OPERATION, // Correctly use the enum
        isEditable: false,
        group: 16,
        class: 35,
        createdBy: null,
        updatedBy: null,
        createdAt: new Date('2024-05-01T00:01:07.595Z'),
        updatedAt: new Date('2024-05-01T00:01:07.595Z'),
      },
      {
        id: 12,
        uuid: 'd20b3cfa-05f4-4054-855d-256d98d58aee',
        code: '200100-001',
        name: 'buyer prepayment',
        mode: Mode.COLLECTION, // Correctly use the enum
        isEditable: false,
        group: 5,
        class: 11,
        createdBy: null,
        updatedBy: null,
        createdAt: new Date('2024-05-01 00:01:10.595145+00:00'),
        updatedAt: new Date('2024-05-01 00:01:10.595145+00:00'),
      },
    ];

    for (const account of accounts) {
      const existingAccount = await this.accountsRepository.findOne({
        where: { code: account.code },
      });
      if (!existingAccount) {
        await this.accountsRepository.save({
          id: account.id,
          uuid: account.uuid,
          code: account.code,
          name: account.name,
          mode: account.mode,
          isEditable: account.isEditable,
          group: { id: account.group }, // Adjust if accountGroup is a relation
          class: { id: account.class }, // Adjust if accountClass is a relation
          createdBy: { id: account.createdBy }, // Assuming createdBy is a User entity reference
          updatedBy: { id: account.updatedBy }, // Assuming updatedBy is a User entity reference
          createdAt: account.createdAt,
          updatedAt: account.updatedAt,
        });
      }
    }
  }

  // ***********************************************************************************************************************************************
  async handleAccountGroupAndClass(
    dto: UpdateAccountDto | CreateAccountDto,
    classId?: number,
    groupId?: number,
  ): Promise<{
    accountClass: Class;
    accountGroup: Group;
  }> {
    // Fetch Account Group
    const accountGroup = await this.groupsRepository.findOneBy({ id: groupId });
    if (!accountGroup) {
      throw new BadRequestException(
        `Account group with ID: ${groupId} not found`,
      );
    }

    // Validate account code
    const accountCode = dto.code.split('-')[0];
    if (accountGroup.code !== accountCode) {
      throw new BadRequestException(
        `Account code (${accountCode}) and group code (${accountGroup.code}) do not match`,
      );
    }

    // Fetch Account class
    const accountClass = await this.classesRepository.findOneBy({
      id: classId,
    });
    if (!accountClass) {
      throw new BadRequestException(
        `Account class with ID: ${classId} not found`,
      );
    }

    // Validate if group type and class type match
    if (accountClass.type !== accountGroup.type) {
      throw new BadRequestException(
        'Account class type and group type do not match',
      );
    }

    return { accountClass, accountGroup };
  }

  // ***********************************************************************************************************************************************
  async create(
    createAccountDto: CreateAccountDto,
  ): Promise<{ message: string }> {
    let {
      name,
      code,
      balance,
      classId,
      groupId,
      ...accountData
    } = createAccountDto;

    // Trim input values
    name = name?.trim();
    code = code?.trim();
    balance = balance?.trim();

    // Ensure name and code are provided and not empty after trimming
    if (!name || !code) {
      throw new BadRequestException(
        'Name and code are required and cannot be empty or just spaces.',
      );
    }

    // Check for duplicate account by name (case-insensitive and trimmed)
    const existingAccountByName = await this.accountsRepository.findOne({
      where: {
        name: Raw((alias) => `LOWER(TRIM(${alias})) = LOWER(TRIM(:name))`, {
          name,
        }),
      },
    });
    if (existingAccountByName) {
      throw new ConflictException(`Account with name ${name} already exists.`);
    }

    // Check for duplicate account by code (case-insensitive and trimmed)
    const existingAccountByCode = await this.accountsRepository.findOne({
      where: {
        code: Raw((alias) => `LOWER(TRIM(${alias})) = LOWER(TRIM(:code))`, {
          code,
        }),
      },
    });
    if (existingAccountByCode) {
      throw new ConflictException(`Account with code ${code} already exists.`);
    }

    // Ensure groupId is provided
    if (!groupId) {
      throw new BadRequestException('Group ID is required');
    }

    // Ensure classId is provided
    if (!classId) {
      throw new BadRequestException('Class ID is required');
    }

    // Handle account class, and account group
    const { accountClass, accountGroup } =
      await this.handleAccountGroupAndClass(
        createAccountDto,
        classId,
        groupId,
      );

    // Ensure required fields are valid
    if (!accountClass || !accountGroup) {
      throw new BadRequestException('Account class or group is invalid.');
    }

    // Validate that the balance is greater than or equal to zero
    if (Number(balance) < 0) {
      throw new BadRequestException(
        'Balance must be greater than or equal to zero.',
      );
    }

    // Handle bank details if classId === 3
    let bankDetails;
    if (classId === 3) {
      bankDetails = new CreateBankDto();
      Object.assign(bankDetails, createAccountDto.bankDetails);

      if (!bankDetails.accountNumber || !bankDetails.bankName) {
        throw new BadRequestException(
          'Bank details (account number and bank name) are required for accounts of classId 3.',
        );
      }

      const errors = await validate(bankDetails); // Validate bank details
      if (errors.length > 0) {
        throw new BadRequestException('Invalid bank details provided.');
      }

      // Check for existing bank with the same account number
      const existingBank = await this.banksRepository.findOne({
        where: { accountNumber: bankDetails.accountNumber },
      });
      if (existingBank) {
        throw new ConflictException(
          `Bank with account number ${bankDetails.accountNumber} already exists.`,
        );
      }
    }

    // Create the account entity with mandatory fields
    const category = this.accountsRepository.create({
      name,
      code,
      balance,
      group: accountGroup,
      class: accountClass,
      ...accountData,
      bankDetails: bankDetails ? bankDetails : undefined, // Include bank details only if available
    });

    // Save the new account
    const account = await this.accountsRepository.save(category);

    // Create Opening Balance for the account
    const currentFinancialYear = await this.financialYearsRepository.findOne({
      where: { isClosed: false },
      order: { createdAt: 'DESC' },
    });

    // Save the new opening balance
    if (currentFinancialYear) {
      const openingBalance = this.balancesRepository.create({
        financialYear: currentFinancialYear,
        account,
        openingBalance: createAccountDto.balance,
      });
      await this.balancesRepository.save(openingBalance);
    } else {
      throw new BadRequestException('No open financial year found.');
    }

    return { message: 'Account created successfully' };
  }

  // ***********************************************************************************************************************************************
  async findAll(searchParams: SearchParams): Promise<any> {
    const { searchTerm, page, pageSize } = searchParams;

    const query = this.accountsRepository
      .createQueryBuilder('accounts')
      .leftJoinAndSelect('accounts.class', 'class') // Join with classes
      .leftJoinAndSelect('accounts.group', 'group') // Join with groups
      .leftJoinAndSelect('accounts.balances', 'balances') // Join with Balances for openingBalance
      .select([
        'accounts',
        'class.name',
        'class.type',
        'class.duration',
        'class.nature',
        'group.name',
        'group.code',
        'group.type',
        'group.mode',
        'balances.openingBalance', // Select openingBalance from Balance table
      ])

    if (searchTerm) {
      query.where(
        '(accounts.name ILIKE :searchTerm OR accounts.code ILIKE :searchTerm OR group.name ILIKE :searchTerm OR group.code ILIKE :searchTerm OR class.name ILIKE :searchTerm)',
        { searchTerm: `%${searchTerm}%` },
      );
    }

    // Create a clone of the query to fetch total count without pagination
    const totalQuery = query.clone().select('COUNT(accounts.id)', 'total');

    // Apply pagination to the original query
    paginate(query, page, pageSize);

    // Fetch raw results and entities
    const { entities: accounts, raw } = await query.getRawAndEntities();

    // Fetch the total count
    const totalResult = await totalQuery.getRawOne();
    const total = parseInt(totalResult?.total || '0', 10);

    // Map the raw results to include fxBalance
    const accountsWithFxBalance = accounts.map((account, index) => ({
      ...account,
      fxBalance: raw[index]?.fxBalance, // Include fxBalance from raw results
    }));

    return buildPaginationResponse(
      accountsWithFxBalance,
      total, // Use the total count fetched separately
      page,
      pageSize,
      '/accounts',
    );
  }

  // ***********************************************************************************************************************************************
  async findRevenueAndExpenseAccounts(): Promise<any> {
    const query = this.accountsRepository
      .createQueryBuilder('accounts')
      .leftJoinAndSelect('accounts.group', 'group') // Join the groups table
      .where('group.type IN (:...types)', { types: ['Revenue', 'Expense'] }) // Check if group type is Revenue or Expense
      .select([
        'accounts.id', // Select account fields
        'accounts.uuid',
        'accounts.code',
        'accounts.name',
        'group.type',
      ]);

    const accounts = await query.getMany(); // Get all without pagination

    return accounts;
  }

  // ***********************************************************************************************************************************************
  async findCashOrBankAccounts(): Promise<any> {
    const query = this.accountsRepository
      .createQueryBuilder('accounts')
      .leftJoinAndSelect('accounts.class', 'class') // Join the classes table
      .where('class.type = :type', { type: 'Asset' })
      .andWhere('class.name IN (:...names)', { names: ['asset cash', 'bank'] }) // Check if class type is Revenue or Expense
      .select([
        'accounts.id', // Select account fields
        'accounts.uuid',
        'accounts.code',
        'accounts.name',
      ]);

    const accounts = await query.getMany(); // Get all without pagination

    return accounts;
  }

  // ***********************************************************************************************************************************************
  async findAllClasses(searchParams: SearchParams): Promise<any> {
    const { searchTerm, page, pageSize } = searchParams;

    const query = this.classesRepository
      .createQueryBuilder('classes')
      .select(['classes']);

    if (searchTerm) {
      query.where('(classes.name ILIKE :searchTerm)', {
        searchTerm: `%${searchTerm}%`,
      });
    }

    paginate(query, page, pageSize);

    const [classes, total] = await query.getManyAndCount();

    return buildPaginationResponse(classes, total, page, pageSize, '/classes');
  }

  // ***********************************************************************************************************************************************
  async findAllGroups(searchParams: SearchParams): Promise<any> {
    const { searchTerm, page, pageSize } = searchParams;

    const query = this.groupsRepository
      .createQueryBuilder('groups')
      .leftJoin('groups.accounts', 'accounts')
      .select(['groups'])
      .addSelect('SUM(accounts.balance)', 'totalBalance')
      .groupBy('groups.id');

    if (searchTerm) {
      query.where(
        '(groups.name ILIKE :searchTerm OR groups.code ILIKE :searchTerm)',
        {
          searchTerm: `%${searchTerm}%`,
        },
      );
    }

    // Paginate the query
    paginate(query, page, pageSize);

    // Fetch raw and entity data
    const { entities: rawGroups, raw: rawData } = await query.getRawAndEntities();

    // Format groups with totalBalance as a string
    const formattedGroups = rawGroups.map((group, index) => ({
      ...group,
      totalBalance: rawData[index]?.totalBalance
        ? parseFloat(rawData[index].totalBalance).toFixed(2) // Convert to string with two decimal places
        : '0.00', // Default value as a string
    }));

    // Get total count after pagination
    const [, totalCount] = await query.getManyAndCount();

    return buildPaginationResponse(
      formattedGroups,
      totalCount,
      page,
      pageSize,
      '/groups',
    );
  }

  // ***********************************************************************************************************************************************
  async findAccountsByGroup(groupId: string): Promise<any> {
    // Query to fetch total balance for the specified group
    const totalBalanceResult = await this.accountsRepository
      .createQueryBuilder('accounts')
      .leftJoin('accounts.group', 'group')
      .where('group.uuid = :groupId', { groupId })
      .select('SUM(accounts.balance)', 'totalBalance')
      .getRawOne();

    // Convert total balance to a string with two decimal places
    const totalBalance = totalBalanceResult?.totalBalance
      ? parseFloat(totalBalanceResult.totalBalance).toFixed(2)
      : '0.00';

    // Fetch group details directly
    const groupDetails = await this.groupsRepository
      .createQueryBuilder('group')
      .where('group.uuid = :groupId', { groupId })
      .getOne();

    // Throw an error if the group is not found
    if (!groupDetails) {
      throw new NotFoundException(`Group not found for ID ${groupId}.`);
    }

    // Query to fetch accounts with class name and multi-currency
    const accounts = await this.accountsRepository
      .createQueryBuilder('accounts')
      .leftJoinAndSelect('accounts.group', 'group')
      .leftJoinAndSelect('accounts.class', 'class') // Assuming 'class' is a relation
      .where('group.uuid = :groupId', { groupId })
      .select([
        'accounts.id', // Account ID
        'accounts.name', // Account Name
        'accounts.balance', // Account Balance
        'accounts.code', // Account Code
        'class.name', // Class Name
        'class.duration', // Class duration
      ])
      .getMany();

    // Map the accounts to include only required data
    const accountsWithDetails = accounts.map((account) => ({
      id: account.id,
      name: account.name,
      balance: account.balance,
      code: account.code,
      className: account.class?.name, // Class name from the related entity
      classDuration: account.class?.duration, // Class duration from the related entity
    }));

    // Return group details along with the list of accounts and total balance
    return {
      group: groupDetails,
      totalBalance,
      accounts: accountsWithDetails,
    };
  }

  // ***********************************************************************************************************************************************
  async findAccountClassesByType(accountType: AccountType): Promise<any> {
    const query = this.classesRepository
      .createQueryBuilder('classes')
      .where('classes.type = :accountType', { accountType })
      .select([
        'classes.id',
        'classes.uuid',
        'classes.name',
        'classes.nature',
        'classes.type',
        'classes.duration',
      ]);

    const typeClass = await query.getMany();

    if (typeClass.length === 0) {
      throw new NotFoundException(
        `No account classes found for type ${accountType}`,
      );
    }

    return typeClass;
  }

  // ***********************************************************************************************************************************************
  async findAccountGroupsByType(accountType: AccountType): Promise<any> {
    const query = this.groupsRepository
      .createQueryBuilder('groups')
      .where('groups.type = :accountType', { accountType })
      .select([
        'groups.id',
        'groups.uuid',
        'groups.name',
        'groups.code',
        'groups.type',
        'groups.mode',
      ]);

    const typeGroup = await query.getMany();

    if (typeGroup.length === 0) {
      throw new NotFoundException(
        `No account groups found for type ${accountType}`,
      );
    }

    return typeGroup;
  }

  // ***********************************************************************************************************************************************
  async findAllStaffs(searchParams: SearchParams): Promise<any> {
    const { searchTerm, page, pageSize } = searchParams;

    const query = this.staffsRepository
      .createQueryBuilder('staffs')
      .select(['staffs']);

    // Apply search filtering for fullName and name
    if (searchTerm) {
      query.where(
        '(staffs.firstName ILIKE :searchTerm OR staffs.lastName ILIKE :searchTerm OR staffs.name ILIKE :searchTerm)',
        { searchTerm: `%${searchTerm}%` },
      );
    }

    // Apply pagination using the utility function
    paginate(query, page, pageSize);

    // Execute query and get results with count
    const [staffs, total] = await query.getManyAndCount();

    // Build the pagination response using the utility function
    return buildPaginationResponse(staffs, total, page, pageSize, '/staffs');
  }

  // ***********************************************************************************************************************************************
  async findAllPaymentsAndRecepts(searchParams: SearchParams): Promise<any> {
    const { searchTerm, page, pageSize } = searchParams;

    const query = this.paymentsAndReceiptsRepository
      .createQueryBuilder('receipts')
      .leftJoinAndSelect('receipts.account', 'account') // Join with account
      .select(['receipts', 'account.name', 'account.code']);

    if (searchTerm) {
      query
        .where(
          '(receipts.reference ILIKE :searchTerm OR receipts.rcvNumber ILIKE :searchTerm)',
          { searchTerm: `%${searchTerm}%` },
        )
        .orWhere("TO_CHAR(receipts.date, 'DD-MM-YYYY') ILIKE :searchTerm", {
          searchTerm: `%${searchTerm}%`,
        })
        .orWhere('CAST(receipts.totalAmount AS TEXT) ILIKE :searchTerm', {
          searchTerm: `%${searchTerm}%`,
        });
    }

    paginate(query, page, pageSize);

    const [receipts, total] = await query.getManyAndCount();

    // Exclude the `status` field using the `excludeFields` utility
    const receiptsWithoutStatus = Array.isArray(receipts)
      ? (excludeFields(receipts, ['status']) as Partial<PaymentAndReceipt>[])
      : [];

    return buildPaginationResponse(
      receiptsWithoutStatus,
      total,
      page,
      pageSize,
      '/payments-&-receipts',
    );
  }

  // ***********************************************************************************************************************************************
  async findAllBankTransfers(searchParams: SearchParams): Promise<any> {
    const { searchTerm, page, pageSize } = searchParams;

    const query = this.bankTransfersRepository
      .createQueryBuilder('transfers')
      .leftJoinAndSelect('transfers.fromAccount', 'fromAccount') // Join with fromAccount
      .leftJoinAndSelect('transfers.toAccount', 'toAccount') // Join with toAccount
      .select([
        'transfers',
        'fromAccount.name',
        'fromAccount.code',
        'toAccount.name',
        'toAccount.code',
      ]);
    if (searchTerm) {
      query
        .where(
          '(transfers.reference ILIKE :searchTerm OR transfers.cvNumber ILIKE :searchTerm)',
          { searchTerm: `%${searchTerm}%` },
        )
        .orWhere("TO_CHAR(transfers.date, 'DD-MM-YYYY') ILIKE :searchTerm", {
          searchTerm: `%${searchTerm}%`,
        })
        .orWhere('CAST(transfers.amount AS TEXT) ILIKE :searchTerm', {
          searchTerm: `%${searchTerm}%`,
        });
    }

    paginate(query, page, pageSize);

    const [transfers, total] = await query.getManyAndCount();

    // Exclude the `status` field using the `excludeFields` utility
    const transfersWithoutStatus = Array.isArray(transfers)
      ? (excludeFields(transfers, ['status']) as Partial<BankTransfer>[])
      : [];

    return buildPaginationResponse(
      transfersWithoutStatus,
      total,
      page,
      pageSize,
      '/bank-transfers',
    );
  }

  // ***********************************************************************************************************************************************
  async findAllJournalEntries(searchParams: SearchParams): Promise<any> {
    const { searchTerm, page, pageSize } = searchParams;

    const query = this.journalEntriesRepository
      .createQueryBuilder('entries')
      .select(['entries']);

    if (searchTerm) {
      query
        .where(
          '(entries.reference ILIKE :searchTerm OR entries.jeNumber ILIKE :searchTerm)',
          { searchTerm: `%${searchTerm}%` },
        )
        .orWhere("TO_CHAR(entries.date, 'DD-MM-YYYY') ILIKE :searchTerm", {
          searchTerm: `%${searchTerm}%`,
        })
        .orWhere('CAST(entries.totalAmount AS TEXT) ILIKE :searchTerm', {
          searchTerm: `%${searchTerm}%`,
        });
    }

    paginate(query, page, pageSize);

    const [entries, total] = await query.getManyAndCount();

    // Exclude the `status` field using the `excludeFields` utility
    const entriesWithoutStatus = Array.isArray(entries)
      ? (excludeFields(entries, ['status']) as Partial<JournalEntry>[])
      : [];

    return buildPaginationResponse(
      entriesWithoutStatus,
      total,
      page,
      pageSize,
      '/journal-entries',
    );
  }

  // ***********************************************************************************************************************************************
  async findAllBudgets(searchParams: SearchParams): Promise<any> {
    const { searchTerm, page, pageSize } = searchParams;

    const query = this.budgetsRepository
      .createQueryBuilder('budgets')
      .leftJoinAndSelect('budgets.financialYear', 'financialYear')
      .leftJoinAndSelect('budgets.budgetItems', 'budgetItems')
      .leftJoinAndSelect('budgetItems.account', 'account')
      .select([
        'budgets',
        'budgetItems',
        'account.balance',
        'financialYear.name',
      ]);

    if (searchTerm) {
      query
        .where(
          '(budgets.financialYearName ILIKE :searchTerm OR budgets.bdgNumber ILIKE :searchTerm)',
          { searchTerm: `%${searchTerm}%` },
        )
        .orWhere('CAST(budgets.totalExpenseAmount AS TEXT) ILIKE :searchTerm', {
          searchTerm: `%${searchTerm}%`,
        })
        .orWhere('CAST(budgets.totalIncomeAmount AS TEXT) ILIKE :searchTerm', {
          searchTerm: `%${searchTerm}%`,
        });
    }

    paginate(query, page, pageSize);

    const [budgets, total] = await query.getManyAndCount();

    // Calculate variance only if budget is approved
    const budgetsWithVariance = budgets.map((budget) => {
      if (budget.status === 'Approved') {
        // Calculate variance for each budget item and then remove it
        const budgetItemsWithoutVariance = budget.budgetItems.map((item) => {
          const actualAmount = Number(item.account?.balance) || 0;
          const itemVariance = Number(item.plannedAmount) - actualAmount;

          // Calculate variance but do not include it in the final item object
          return {
            ...item,
            // Removed variance property here to exclude from final output
          };
        });

        // Group variances by budgetItems.type
        const varianceByType = budgetItemsWithoutVariance.reduce(
          (acc, item) => {
            if (item.type === BudgetAccount.EXPENSE) {
              acc.expenseVariance +=
                Number(item.plannedAmount) - Number(item.account?.balance || 0);
            } else if (item.type === BudgetAccount.INCOME) {
              acc.incomeVariance +=
                Number(item.plannedAmount) - Number(item.account?.balance || 0);
            }
            return acc;
          },
          { expenseVariance: 0, incomeVariance: 0 },
        );

        return {
          ...budget,
          budgetItems: budgetItemsWithoutVariance, // Updated items without variance
          varianceByType, // Add grouped variance by type
        };
      } else {
        // If budget is not approved, return without variance calculation
        return budget;
      }
    });

    // Exclude the `status` field using the `excludeFields` utility and ensure the result is an array
    const budgetsWithoutStatus = excludeFields(budgetsWithVariance, [
      'status',
    ]) as Partial<Budget>[];

    return buildPaginationResponse(
      Array.isArray(budgetsWithoutStatus)
        ? budgetsWithoutStatus
        : [budgetsWithoutStatus],
      total,
      page,
      pageSize,
      '/budgets',
    );
  }

  // ***********************************************************************************************************************************************
  async findAllAdjustmentsByBudget(
    uuid: string,
    searchParams: SearchParams,
  ): Promise<any> {
    const { searchTerm, page, pageSize } = searchParams;

    if (!isUUID(uuid)) {
      throw new BadRequestException('Invalid ID format');
    }

    // Check if the budget exists
    const budget = await this.budgetsRepository.findOne({
      where: { uuid },
    });

    if (!budget) {
      throw new NotFoundException(`Budget with ID ${uuid} not found`);
    }

    if (!budget.isApproved) {
      throw new NotFoundException(`Budget with ID ${uuid} not approved`);
    }

    const query = this.budgetAdjustmentsRepository
      .createQueryBuilder('adjustments')
      .leftJoinAndSelect('adjustments.budget', 'budget')
      .leftJoinAndSelect('budget.financialYear', 'financialYear')
      .select([
        'adjustments',
        'budget.id',
        'budget.uuid',
        'budget.bdgNumber',
        'financialYear.name',
      ])
      .where('budget.uuid = :uuid', { uuid }); // Ensure adjustments belong to the specific budget

    if (searchTerm) {
      query.andWhere(
        new Brackets((qb) => {
          qb.where(
            '(financialYear.name ILIKE :searchTerm OR budget.bdgNumber ILIKE :searchTerm)',
            { searchTerm: `%${searchTerm}%` },
          )
            .orWhere(
              'CAST(adjustments.totalExpenseAmount AS TEXT) ILIKE :searchTerm',
              {
                searchTerm: `%${searchTerm}%`,
              },
            )
            .orWhere(
              'CAST(adjustments.totalIncomeAmount AS TEXT) ILIKE :searchTerm',
              {
                searchTerm: `%${searchTerm}%`,
              },
            );
        }),
      );
    }

    paginate(query, page, pageSize);

    const [adjustments, total] = await query.getManyAndCount();

    // Exclude the `status` field using the `excludeFields` utility
    const adjustmentsWithoutStatus = excludeFields(adjustments, [
      'status',
    ]) as Partial<BudgetAdjustment>[];

    return buildPaginationResponse(
      adjustmentsWithoutStatus,
      total,
      page,
      pageSize,
      '/budget-adjustments',
    );
  }

  // ***********************************************************************************************************************************************
  async findItemsByBudget(uuid: string): Promise<any> {
    if (!isUUID(uuid)) {
      throw new BadRequestException('Invalid ID format');
    }

    const budget = await this.budgetsRepository.findOne({
      where: { uuid },
      relations: ['budgetItems', 'budgetItems.account'],
    });

    if (!budget) {
      throw new NotFoundException(`Budget with ID ${uuid} not found`);
    }

    if (!budget.isApproved) {
      throw new NotFoundException(`Budget with ID ${uuid} not approved`);
    }

    // Separate budget items by type
    const expenseBudgetItems = budget.budgetItems
      .filter((item) => item.type === 'Expense')
      .map((item) => ({
        budgetItemId: item.id,
        budgetItemUuid: item.uuid,
        currentAmount: item.plannedAmount,
        balance: item.account.balance,
        previousAmount: item.plannedAmount,
        accountName: item.account.name,
        budgetType: item.type,
      }));

    const incomeBudgetItems = budget.budgetItems
      .filter((item) => item.type === 'Income')
      .map((item) => ({
        budgetItemId: item.id,
        budgetItemUuid: item.uuid,
        currentAmount: item.plannedAmount,
        balance: item.account.balance,
        previousAmount: item.plannedAmount,
        accountName: item.account.name,
        budgetType: item.type,
      }));

    return {
      budgetItems: [
        {
          expenseBudgetItems,
          incomeBudgetItems,
        },
      ],
    };
  }

  // ***********************************************************************************************************************************************
  async findOne(uuid: string): Promise<any> {
    // Validate UUID format for ID
    if (!isUUID(uuid)) {
      throw new BadRequestException('Invalid UUID format');
    }

    // Fetch account along with related class and group details
    const account = await this.accountsRepository.findOne({
      where: { uuid },
      relations: ['class', 'group', 'balances'], // Adjust relation names if necessary
    });

    if (!account) {
      throw new NotFoundException(`Account with ID: ${uuid} not found.`);
    }

    return account;
  }

  // ***********************************************************************************************************************************************
  async calculateNewAccountBalance(
    account: Account,
    updateAccountDto: UpdateAccountDto,
    accountBalance: Balance,
  ): Promise<{ newCalculatedBalance: number; newBalance: number }> {
    const newCalculatedBalance =
      parseFloat(account.balance) -
      parseFloat(accountBalance.openingBalance) +
      parseFloat(updateAccountDto.balance);
    if (newCalculatedBalance < 0) {
      throw new BadRequestException(
        `New balance is ${newCalculatedBalance}. Balance can not` +
        `be negative, Please post all other missed transactions` +
        'on this account before updating opening balance',
      );
    }
    return {
      newCalculatedBalance,
      newBalance: parseFloat(updateAccountDto.balance),
    };
  }

  // ***********************************************************************************************************************************************
  async update(
    uuid: string,
    updateAccountDto: UpdateAccountDto,
  ): Promise<{ message: string }> {
    // Destructure and trim string fields
    const { name, code, classId, groupId, ...accountData } =
      updateAccountDto;

    // Trim only the necessary string fields
    const trimmedDto = {
      ...updateAccountDto,
      name: name?.trim(),
      code: code?.trim(),
      classId, // classId is not trimmed, assuming it's numeric
      groupId, // groupId is not trimmed, assuming it's numeric
      accountData, // accountData is not trimmed, assuming it's numeric
    };

    // Validate UUID format for ID
    if (!isUUID(uuid)) {
      throw new BadRequestException('Invalid UUID format');
    }

    // Fetch the account to be updated
    const account = await this.accountsRepository.findOne({
      where: { uuid },
    });
    if (!account) {
      throw new NotFoundException(`Account with ID: ${uuid} not found.`);
    }

    // Validate if the account is editable
    if (!account.isEditable) {
      throw new BadRequestException('This account cannot be edited.');
    }

    // Duplicate check logic - should happen before updating
    const duplicateCheckConditions = [
      { field: 'code', value: trimmedDto.code },
      { field: 'name', value: trimmedDto.name },
    ];

    for (const condition of duplicateCheckConditions) {
      // Only apply TRIM and LOWER to string fields
      const isStringField = ['code', 'name'].includes(condition.field);
      const conditionValue = isStringField ? `LOWER(TRIM(:value))` : `:value`; // Only trim strings

      const existingAccount = await this.accountsRepository
        .createQueryBuilder('account')
        .where(
          `LOWER(TRIM(account.${condition.field})) = LOWER(TRIM(:value))`,
          { value: condition.value },
        )
        .andWhere('account.uuid != :uuid', { uuid })
        .getOne();

      if (existingAccount) {
        throw new ConflictException(
          `Another account with ${condition.field} ${condition.value} already exists.`,
        );
      }
    }

    // Handle Account class and Account group
    const { accountClass, accountGroup } =
      await this.handleAccountGroupAndClass(
        updateAccountDto,
        classId,
        groupId,
      );

    // Fetch the latest account balance
    const accountBalance = await this.balancesRepository.findOne({
      where: { account: { id: account.id } },
    });

    // Calculate new balance and validate to avoid negative balance
    const { newCalculatedBalance, newBalance } =
      await this.calculateNewAccountBalance(
        account,
        updateAccountDto,
        accountBalance,
      );

    // Update Account details
    if (groupId) {
      account.group = accountGroup;
    }
    if (classId) {
      account.class = accountClass;
    }

    // Ensure balance is updated correctly as a string
    accountData.balance = newCalculatedBalance.toString();

    // Assign the updated data to the account entity
    Object.assign(account, accountData, updateAccountDto);
    await this.accountsRepository.save(account);

    // Update opening balance in the balance entity
    accountBalance.openingBalance = newBalance.toString();
    await this.balancesRepository.save(accountBalance);

    return { message: 'Account updated successfully' };
  }
}
