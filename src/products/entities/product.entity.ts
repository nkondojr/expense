import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn } from 'typeorm';
import { Category } from 'src/categories/entities/category.entity';
import { User } from 'src/users/entities/user.entity';

@Entity()
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  price: string;

  @Column()
  description: string;

  @Column()
  image: string;

  @Column({ nullable: false })
  categoryId: string;

  @ManyToOne(() => Category, category => category.products)
  category: Category;

  @ManyToOne(() => User, user => user.products)
  user: User;

  @CreateDateColumn()
  createdAt: Date;
}
