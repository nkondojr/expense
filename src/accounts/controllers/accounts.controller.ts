import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { CreateAccountDto } from '../dto/accounts/create-account.dto';
import { UpdateAccountDto } from '../dto/accounts/update-account.dto';
import { AccountsService } from '../../seeders/accounts.service';
import { AccountType } from '../entities/class.entity';
import { SearchParams } from 'utils/search-parms.util';
import { JwtAuthGuard } from 'src/authentication/guards/jwt-auth.guard';

@Controller()
@UseGuards(JwtAuthGuard)
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  // ***********************************************************************************************************************************************
  @Post()
  @UsePipes(CreateAccountDto)
  async create(@Body() createAccountDto: CreateAccountDto) {
    return await this.accountsService.create(createAccountDto);
  }

  // ***********************************************************************************************************************************************
  @Get()
  async findAll(
    @Query('search') search: string,
    @Query('page') page: number,
    @Query('pageSize') pageSize: number,
  ): Promise<any> {
    const searchParams = new SearchParams(search, page, pageSize);
    return this.accountsService.findAll(searchParams);
  }

  //***********************************************************************************************************************************************
  @Get('staffs')
  async findAllStaffs(
    @Query('search') search: string,
    @Query('page') page: number,
    @Query('pageSize') pageSize: number,
  ): Promise<any> {
    const searchParams = new SearchParams(search, page, pageSize);
    return this.accountsService.findAllStaffs(searchParams);
  }

  //***********************************************************************************************************************************************
  @Get('payments-and-receipts')
  async getAllPaymentsAndRecepts(
    @Query('search') search: string,
    @Query('page') page: number,
    @Query('pageSize') pageSize: number,
  ): Promise<any> {
    const searchParams = new SearchParams(search, page, pageSize);
    return this.accountsService.findAllPaymentsAndRecepts(searchParams);
  }

  //***********************************************************************************************************************************************
  @Get('bank-transfers')
  async getAllBankTransfers(
    @Query('search') search: string,
    @Query('page') page: number,
    @Query('pageSize') pageSize: number,
  ): Promise<any> {
    const searchParams = new SearchParams(search, page, pageSize);
    return this.accountsService.findAllBankTransfers(searchParams);
  }

  //***********************************************************************************************************************************************
  @Get('journal-entries')
  async getAllJournalEntries(
    @Query('search') search: string,
    @Query('page') page: number,
    @Query('pageSize') pageSize: number,
  ): Promise<any> {
    const searchParams = new SearchParams(search, page, pageSize);
    return this.accountsService.findAllJournalEntries(searchParams);
  }

  //***********************************************************************************************************************************************
  @Get('budgets')
  async getBudgets(
    @Query('search') search: string,
    @Query('page') page: number,
    @Query('pageSize') pageSize: number,
  ): Promise<any> {
    const searchParams = new SearchParams(search, page, pageSize);
    return this.accountsService.findAllBudgets(searchParams);
  }

  //***********************************************************************************************************************************************
  @Get('budgets/:uuid/adjustments')
  async getAdjustmentByBudget(
    @Param('uuid') uuid: string,
    @Query('search') search: string,
    @Query('page') page: number,
    @Query('pageSize') pageSize: number,
  ): Promise<any> {
    const searchParams = new SearchParams(search, page, pageSize);
    return this.accountsService.findAllAdjustmentsByBudget(uuid, searchParams);
  }

  // ***********************************************************************************************************************************************
  @Get('budgets/:uuid/items')
  async getItemsByBudget(@Param('uuid') uuid: string): Promise<any> {
    return this.accountsService.findItemsByBudget(uuid);
  }

  // ***********************************************************************************************************************************************
  @Get('revenue-and-expense')
  async getRevenueAndExpenseAccounts(): Promise<any> {
    return await this.accountsService.findRevenueAndExpenseAccounts();
  }

  // ***********************************************************************************************************************************************
  @Get('cash-or-bank')
  async getCashOrBankAccounts(): Promise<any> {
    return await this.accountsService.findCashOrBankAccounts();
  }

  // ***********************************************************************************************************************************************
  @Get('classes')
  async findAllClasses(
    @Query('search') search: string,
    @Query('page') page: number,
    @Query('pageSize') pageSize: number,
  ): Promise<any> {
    const searchParams = new SearchParams(search, page, pageSize);
    return this.accountsService.findAllClasses(searchParams);
  }

  // ***********************************************************************************************************************************************
  @Get('groups')
  async findAllGroups(
    @Query('search') search: string,
    @Query('page') page: number,
    @Query('pageSize') pageSize: number,
  ): Promise<any> {
    const searchParams = new SearchParams(search, page, pageSize);
    return this.accountsService.findAllGroups(searchParams);
  }

  // ***********************************************************************************************************************************************
  @Get('groups/:groupId')
  async getAccountsByGroup(@Param('groupId') groupId: string) {
    return this.accountsService.findAccountsByGroup(groupId);
  }

  // ***********************************************************************************************************************************************
  @Get('classes-by-type')
  async getClassesByType(
    @Query('accountType') accountType: string,
  ): Promise<any> {
    // Ensure accountType is a valid enum string, then cast it to accountType
    if (!Object.values(AccountType).includes(accountType as AccountType)) {
      throw new BadRequestException(`Invalid account type: ${accountType}`);
    }
    return this.accountsService.findAccountClassesByType(
      accountType as AccountType,
    );
  }

  // ***********************************************************************************************************************************************
  @Get('groups-by-type')
  async getGroupsByType(
    @Query('accountType') accountType: string,
  ): Promise<any> {
    // Ensure accountType is a valid enum string, then cast it to accountType
    if (!Object.values(AccountType).includes(accountType as AccountType)) {
      throw new BadRequestException(`Invalid account type: ${accountType}`);
    }
    return this.accountsService.findAccountGroupsByType(
      accountType as AccountType,
    );
  }

  // ***********************************************************************************************************************************************
  @Get(':uuid')
  async findOne(@Param('uuid') uuid: string) {
    return await this.accountsService.findOne(uuid);
  }

  // ***********************************************************************************************************************************************
  @Patch(':uuid')
  async update(
    @Param('uuid') uuid: string,
    @Body() updateAccountDto: UpdateAccountDto,
  ) {
    const result = await this.accountsService.update(uuid, updateAccountDto);
    return result;
  }
}
