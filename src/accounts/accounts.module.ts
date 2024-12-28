import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account } from './entities/account.entity';
import { Group } from './entities/group.entity';
import { Class } from './entities/class.entity';
import { BankTransfer } from './entities/journals/bank-transfers/bank-transfer.entity';
import { Budget } from './entities/budgets/budget.entity';
import { JournalEntry } from './entities/journals/journal-entries/journal-entry.entity';
import { JournalEntryItem } from './entities/journals/journal-entries/journal-entry-item.entity';
import { BudgetItem } from './entities/budgets/budget-item.entity';
import { BudgetAdjustment } from './entities/budgets/adjustments/budget-adjustment.entity';
import { BudgetAdjustmentItem } from './entities/budgets/adjustments/budget-adjustement-item.entity';
import { Balance } from './entities/balance.entity';
import { Transaction } from './entities/transaction.entity';
import { RouterModule } from '@nestjs/core';
import { ClassesService } from '../seeders/classes.service';
import { GroupsController } from './controllers/groups.controller';
import { GroupsService } from '../seeders/groups.service';
import { AccountsService } from '../seeders/accounts.service';
import { AccountsController } from './controllers/accounts.controller';
import { BalanceService } from 'src/seeders/balances.service';
import { Staff } from './entities/staff.entity';
import { StaffService } from './service/staffs.service';
import { StaffController } from './controllers/staffs.controller';
import { OrganizationModule } from 'src/organizations/organizations.module';
import { FinancialYear } from 'src/organizations/entities/financial-years/financial-year.entity';
import { PaymentsAndReceiptsService } from './service/journals/payments-&-receipts/payments-&-receipts.service';
import { PaymentAndReceipt } from './entities/journals/payments-&-receipts/payment-&-receipt.entity';
import { PaymentAndReceiptItem } from './entities/journals/payments-&-receipts/payment-&-receipt-item.entity';
import { BankTransfersController } from './controllers/journals/bank-transfers/bank-transfers.controller';
import { BankTransfersService } from './service/journals/bank-transfers/bank-transfers.service';
import { PaymentsAndReceiptsController } from './controllers/journals/payments-&-receipts/payments-&-receipts.controller';
import { JournalEntriesService } from './service/journals/journal-entries/journal-entries.service';
import { JournalEntriesController } from './controllers/journals/journal-entries/journal-entries.controller';
import { BudgetsService } from './service/budgets/budgets.service';
import { BudgetsController } from './controllers/budgets/budgets.controller';
import { BudgetAdjustmentsController } from './controllers/budgets/budget-adjustments.controller';
import { BudgetAdjustmentsService } from './service/budgets/budget-adjustments.service';
import { Bank } from 'src/organizations/entities/banks/bank.entity';
import { AuthenticationModule } from 'src/authentication/authentication.module';

@Module({
  imports: [
    //Prefix accounts endpoints
    RouterModule.register([
      {
        path: 'accounts',
        module: AccountsModule,
      },
    ]),
    TypeOrmModule.forFeature([
      //Accounts
      Account,
      Bank,
      Group,
      Class,
      Balance,
      Transaction,
      FinancialYear,

      //Staff
      Staff,

      //Jouurnal Entries
      JournalEntry,
      JournalEntryItem,

      //Bank Transfer
      BankTransfer,

      //Journals (Payment & Receipt)
      PaymentAndReceipt,
      PaymentAndReceiptItem,

      //Budget
      Budget,
      BudgetItem,
      BudgetAdjustment,
      BudgetAdjustmentItem,
    ]),
    forwardRef(() => AuthenticationModule), // Use forwardRef to avoid circular dependency
    OrganizationModule,
  ],
  controllers: [
    GroupsController,
    AccountsController,
    StaffController,
    PaymentsAndReceiptsController,
    BankTransfersController,
    JournalEntriesController,
    BudgetsController,
    BudgetAdjustmentsController,
  ],
  providers: [
    ClassesService,
    GroupsService,
    AccountsService,
    BalanceService,
    StaffService,
    PaymentsAndReceiptsService,
    BankTransfersService,
    JournalEntriesService,
    BudgetsService,
    BudgetAdjustmentsService,
  ],
  exports: [TypeOrmModule],
})
export class AccountsModule {}
