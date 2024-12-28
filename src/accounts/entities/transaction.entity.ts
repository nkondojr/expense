import { User } from 'src/users/entities/user.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  Index,
  Generated,
} from 'typeorm';
import { Account } from './account.entity';
import { Nature } from './class.entity';

// Transaction Type Enum
export enum TransactionType {
  SALE_INVOICE = 'SI',
  RECEIPT = 'RC',
  PURCHASE_INVOICE = 'PI',
  PAYMENT = 'PAY',
  REPAYMENT = 'RPY',
  SHARE = 'SHR',
  CONTRIBUTION = 'CONTR',
  JOURNAL_ENTRY = 'JE',
  GRN = 'GRN',
  ISSUE = 'ISSUE',
  CONTRA_VOUCHER = 'CV',
  PAYMENT_RECEIPT_VOUCHER = 'PRV',
  PENALTY = 'PNT',
  PAYROLL = 'PAYRL',
}

@Entity('accounts_transaction')
export class Transaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'uuid', unique: true })
  @Generated('uuid')
  uuid: string;

  @Column({ type: 'date' })
  date: Date;

  @Column('decimal', { precision: 20, scale: 4, default: 0 })
  amount: string;

  @Index()
  @ManyToOne(() => Account, (account) => account.transactions, {
    onDelete: 'CASCADE',
  })
  account: Account;

  @Column({
    type: 'enum',
    enum: Nature,
  })
  transactionNature: Nature;

  @Column({
    type: 'enum',
    enum: TransactionType,
  })
  type: TransactionType;

  @Column({ length: 50 })
  record: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isReversed: boolean;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  createdBy: User;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  updatedBy: User;

  @Index()
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
