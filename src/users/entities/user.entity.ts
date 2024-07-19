import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import * as bcrypt from 'bcrypt';
import { Category } from "src/categories/entities/category.entity";
import { Product } from "src/products/entities/product.entity";
import { Expense } from "src/expense/entities/expense.entity";

@Entity()
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true, nullable: false })
    full_name: string;

    @Column({ unique: true, nullable: false })
    email: string;

    @Column({ unique: true, nullable: false })
    mobile: string;

    @Column({ nullable: false })
    password: string;

    @OneToMany(() => Category, category => category.user)
    categories: Category[];

    @OneToMany(() => Product, product => product.user)
    products: Product[];

    @OneToMany(() => Expense, expense => expense.createdBy)
    expenses: Expense[];

    async validatePassword(password: string): Promise<boolean> {
        return bcrypt.compare(password, this.password);
    }
}
