import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, OneToMany } from 'typeorm';
import { Category } from 'src/categories/entities/category.entity';
import { User } from 'src/users/entities/user.entity';
import { ExpenseItem } from 'src/expense_items/entities/expense_item.entity';

@Entity()
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, nullable: false })
  name: string;

  @Column()
  unit: string;

  @Column({ type: 'text', nullable: false })
  description: string;

  @Column({ type: 'text', nullable: true })
  image: string;

  @Column({ nullable: false })
  categoryId: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;

  @ManyToOne(() => User, user => user.products)
  user: User;

  @ManyToOne(() => Category, category => category.products)
  category: Category;

  @OneToMany(() => ExpenseItem, expenseItems => expenseItems.product)
  expenseItems: ExpenseItem[];
}
