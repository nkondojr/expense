import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Expense } from 'src/expense/entities/expense.entity';
import { Product } from 'src/products/entities/product.entity';

@Entity()
export class ExpenseItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  quantity: number;

  @Column()
  unit: string;

  @Column({ type: 'decimal' })
  price: number;

  @ManyToOne(() => Expense, expense => expense.expenseItems, { onDelete: 'CASCADE' })
  expense: Expense;

  @ManyToOne(() => Product, { eager: true })  // Ensure product is loaded eagerly
  product: Product;
}
