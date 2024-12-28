import { User } from 'src/users/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  OneToMany,
  Index,
  Generated,
} from 'typeorm';
import { BudgetItem } from './budget-item.entity';
import { BudgetAdjustment } from './adjustments/budget-adjustment.entity';
import { FinancialYear } from 'src/organizations/entities/financial-years/financial-year.entity';

@Entity('accounts_budget')
export class Budget {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'uuid', unique: true })
  @Generated('uuid')
  uuid: string;

  @Column({ unique: true, nullable: false })
  bdgNumber: string;

  @Column({ unique: true, nullable: false })
  financialYearId: number;

  // Define the FinancialYear relation
  @ManyToOne(() => FinancialYear, (financialYear) => financialYear.budgets, {
    eager: false,
  })
  @JoinColumn({ name: 'financialYearId' })
  financialYear: FinancialYear;

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

  @Column({ type: 'boolean', default: true })
  isOpen: boolean;

  @Index()
  @Column({ type: 'boolean', default: false })
  isApproved: boolean;

  @Index()
  @Column({ type: 'boolean', default: false })
  isAdditional: boolean;

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
  @OneToMany(() => BudgetItem, (budgetItem) => budgetItem.budget, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  budgetItems: BudgetItem[];

  @OneToMany(() => BudgetAdjustment, (adjustment) => adjustment.budget)
  adjustments: BudgetAdjustment[];
}
