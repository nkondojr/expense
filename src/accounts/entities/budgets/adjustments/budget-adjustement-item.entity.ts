import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  Index,
} from 'typeorm';
import { Account } from '../../account.entity';
import { BudgetAdjustment } from './budget-adjustment.entity';
import { BudgetAccount } from '../budget-item.entity';

@Entity('accounts_budget_adjustment_item')
export class BudgetAdjustmentItem {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Account, {
    eager: true,
  })
  account: Account;

  @Column({
    type: 'enum',
    enum: BudgetAccount,
  })
  type: BudgetAccount;

  @Column('decimal', { precision: 20, scale: 4 })
  currentAmount: string;

  @Column('decimal', { precision: 20, scale: 4 })
  previousAmount: string;

  @Column({ type: 'text', nullable: true })
  comment?: string;

  @Index()
  @ManyToOne(
    () => BudgetAdjustment,
    (budgetAdjustment) => budgetAdjustment.budgetAdjustmentItems,
  )
  budgetAdjustment: BudgetAdjustment;
}
