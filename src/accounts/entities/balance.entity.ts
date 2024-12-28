import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  Generated,
} from 'typeorm';
import { Account } from './account.entity';
import { User } from 'src/users/entities/user.entity';
import { FinancialYear } from 'src/organizations/entities/financial-years/financial-year.entity';

@Entity('accounts_balance')
export class Balance {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'uuid', unique: true })
  @Generated('uuid')
  uuid: string;

  @Column('decimal', { precision: 16, scale: 4, default: 0 })
  openingBalance: string;

  @Column('decimal', { precision: 16, scale: 4, nullable: true })
  closingBalance: string | null;

  @Index()
  @ManyToOne(() => Account, (account) => account.balances, {
    onDelete: 'CASCADE',
  })
  account: Account;

  @Index()
  @ManyToOne(() => FinancialYear, {
    onDelete: 'CASCADE',
  })
  financialYear: FinancialYear;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  createdBy: User;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  updatedBy: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
