import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  Index,
  Generated,
  JoinColumn,
} from 'typeorm';
import { Account } from '../account.entity';
import { Budget } from './budget.entity';

// BudgetAccount Enum
export enum BudgetAccount {
  EXPENSE = 'Expense',
  INCOME = 'Income',
}

@Entity('accounts_budget_item')
export class BudgetItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'uuid', unique: true })
  @Generated('uuid') // Automatically generates UUID
  uuid: string;

  @ManyToOne(() => Account, (account) => account.budgetItems, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'accountId' })
  account: Account;

  @Column({
    type: 'enum',
    enum: BudgetAccount,
  })
  type: BudgetAccount;

  @Column('decimal', { precision: 20, scale: 4 })
  plannedAmount: string;

  @Index()
  @ManyToOne(() => Budget, (budget) => budget.budgetItems)
  budget: Budget;
}
