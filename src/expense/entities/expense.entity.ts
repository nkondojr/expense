import { ExpenseItem } from 'src/expense_items/entities/expense_item.entity';
import { User } from 'src/users/entities/user.entity';
import { Report } from 'src/reports/entities/report.entity';
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, OneToMany, ManyToOne } from 'typeorm';

@Entity()
export class Expense {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'date' })
  date: Date;

  @Column({ type: 'decimal' })
  amount: number;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'text', nullable: true })
  attachment: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;

  @ManyToOne(() => User, user => user.expenses)
  createdBy: User;

  @OneToMany(() => Report, reports => reports.expense)
  reports: Report[];

  @OneToMany(() => ExpenseItem, expenseItems => expenseItems.expense)
  expenseItems: ExpenseItem[];
}
