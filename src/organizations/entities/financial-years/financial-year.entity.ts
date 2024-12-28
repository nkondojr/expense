import { Budget } from 'src/accounts/entities/budgets/budget.entity';
import { Payroll } from 'src/hr-payroll/entities/payroll/payroll.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Generated,
  OneToMany,
} from 'typeorm';

@Entity('organisation_financial_year')
export class FinancialYear {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'uuid', unique: true })
  @Generated('uuid')
  uuid: string;

  @Column({ unique: true, length: 10 })
  name: string;

  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date' })
  endDate: Date;

  @Column({ default: false })
  isClosed: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Payroll, (payrolls) => payrolls.financialYear)
  payrolls: Payroll[];

  @OneToMany(() => Budget, (budgets) => budgets.financialYear)
  budgets: Budget[];
}
