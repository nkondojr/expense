import { User } from 'src/users/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToMany,
  Generated,
} from 'typeorm';
import { Budget } from '../budget.entity';
import { BudgetAdjustmentItem } from './budget-adjustement-item.entity';

@Entity('accounts_budget_adjustment')
export class BudgetAdjustment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'uuid', unique: true })
  @Generated('uuid')
  uuid: string;

  @Column({ type: 'date' })
  date: Date;

  @Column({ nullable: false })
  budgetId: number;

  @Column('decimal', { precision: 20, scale: 4 })
  totalIncomeAmount: string;

  @Column('decimal', { precision: 20, scale: 4 })
  totalExpenseAmount: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'varchar', length: 125, nullable: true })
  attachment?: string;

  @Column({ default: 'Pending' })
  status: string; // Status of the bank transfer (e.g., Pending, Approved, etc.)

  @Column({ type: 'boolean', default: false })
  isApproved: boolean;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  approvedBy?: User;

  @Column({ type: 'timestamp', nullable: true })
  approvedAt?: Date;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  createdBy?: User;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  updatedBy?: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // REFERENCED RELATIONS
  @OneToMany(
    () => BudgetAdjustmentItem,
    (budgetAdjustmentItem) => budgetAdjustmentItem.budgetAdjustment,
    {
      cascade: true,
      onDelete: 'CASCADE',
    },
  )
  budgetAdjustmentItems: BudgetAdjustmentItem[];

  @Index()
  @ManyToOne(() => Budget, (budget) => budget.adjustments)
  budget: Budget;
}
