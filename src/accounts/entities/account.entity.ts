import { User } from 'src/users/entities/user.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  Index,
  OneToMany,
  Generated,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Class } from './class.entity';
import { Group, Mode } from './group.entity';
import { Balance } from './balance.entity';
import { Transaction } from './transaction.entity';
import { BankTransfer } from './journals/bank-transfers/bank-transfer.entity';
import { PaymentAndReceipt } from './journals/payments-&-receipts/payment-&-receipt.entity';
import { BudgetItem } from './budgets/budget-item.entity';
import { Length } from 'class-validator';
import { Bank } from 'src/organizations/entities/banks/bank.entity';
import { PayrollAccount } from 'src/hr-payroll/entities/payroll/payroll-accounts.entity';

@Entity('accounts_account')
export class Account {
  opening: Balance;

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'uuid', unique: true })
  @Generated('uuid')
  uuid: string;

  @Index({ unique: true })
  @Column({ unique: true, length: 50 })
  code: string;

  @Column({ unique: true, length: 100 })
  @Length(1, 100)
  name: string;

  @Column({
    type: 'enum',
    enum: Mode,
  })
  mode: Mode;

  @Column('decimal', { precision: 20, scale: 4, default: 0 })
  balance: string;

  @Column({ default: true })
  isEditable: boolean;

  @Index()
  @ManyToOne(() => Group, (accountgGroup) => accountgGroup.accounts, {
    onDelete: 'CASCADE',
  })
  group: Group;

  @Index()
  @ManyToOne(() => Class, (accountClass) => accountClass.accounts, {
    onDelete: 'CASCADE',
  })
  class: Class;

  // If `fromAccountId` in BankTransfers points to this Account
  @OneToMany(() => BankTransfer, (transfer) => transfer.fromAccount)
  fromTransfers: BankTransfer[];

  // If `toAccountId` in BankTransfer points to this Account
  @OneToMany(() => BankTransfer, (transfer) => transfer.toAccount)
  toTransfers: BankTransfer[];

  // If `accountId` in PaymentAndReceipt points to this Account
  @OneToMany(() => PaymentAndReceipt, (receipt) => receipt.account)
  receipts: PaymentAndReceipt[];

  @Index()
  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  createdBy: User;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  updatedBy: User;

  @Index()
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  //REFERENCED RELATIONS
  @OneToOne(() => Bank, (bankDetails) => bankDetails.account, {
    cascade: true,
    nullable: true,
  })
  @JoinColumn()
  bankDetails?: Bank;

  // @OneToMany(
  //   () => CategoryAccount,
  //   (categoryAccount) => categoryAccount.account,
  // )
  // categoryAccounts: CategoryAccount[];

  @OneToMany(() => Balance, (balance) => balance.account)
  balances: Balance[];

  @OneToMany(() => Transaction, (transaction) => transaction.account)
  transactions: Transaction[];

  @OneToMany(() => BudgetItem, (budgetItem) => budgetItem.account)
  budgetItems: BudgetItem[];

  @OneToMany(() => PayrollAccount, (payrollAccounts) => payrollAccounts.liabilityAccount)
  payrollAccounts: PayrollAccount[];

  @OneToMany(() => PayrollAccount, (payrollAccountss) => payrollAccountss.expenseAccount)
  payrollAccountss: PayrollAccount[];
}
