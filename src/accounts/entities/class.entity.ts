import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  OneToMany,
  Generated,
} from 'typeorm';
import { Account } from './account.entity';
import { Length } from 'class-validator';

// Account Type Enum
export enum AccountType {
  ASSET = 'Asset',
  LIABILITY = 'Liability',
  EQUITY = 'Equity',
  REVENUE = 'Revenue',
  EXPENSE = 'Expense',
}

// Nature Enum
export enum Nature {
  DEBITOR = 'DR',
  CREDITOR = 'CR',
}

// Duration Enum
export enum Duration {
  CURRENT_ASSET = 'Current Asset',
  NON_CURRENT_ASSET = 'Non Current Asset',
  CURRENT_LIABILITY = 'Current Liability',
  NON_CURRENT_LIABILITY = 'Non Current Liability',
  PERFORMANCE = 'Performance',
}

@Entity('accounts_class')
export class Class {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'uuid', unique: true })
  @Generated('uuid')
  uuid: string;

  @Column({ unique: true, length: 100 })
  @Length(1, 100)
  name: string;

  @Column({
    type: 'enum',
    enum: AccountType,
  })
  type: AccountType;

  @Column({
    type: 'enum',
    enum: Duration,
    nullable: true,
  })
  duration: Duration;

  @Column({
    type: 'enum',
    enum: Nature,
  })
  nature: Nature;

  @Column({ default: true })
  isEditable: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @CreateDateColumn()
  updatedAt: Date;

  // Referenced Relationships
  @OneToMany(() => Account, (account) => account.class)
  accounts: Account[];
}
