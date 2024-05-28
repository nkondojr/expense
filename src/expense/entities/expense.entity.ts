import { ExpenseItem } from 'src/expense_items/entities/expense_item.entity';
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, OneToMany } from 'typeorm';

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

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => ExpenseItem, expenseItems => expenseItems.expense)
  expenseItems: ExpenseItem[];
}
