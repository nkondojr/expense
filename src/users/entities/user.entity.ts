import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import * as bcrypt from 'bcrypt';
import { Category } from "src/categories/entities/category.entity";
import { Product } from "src/products/entities/product.entity";

@Entity()
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ nullable: false})
    fullName: string;

    @Column({ unique: true, nullable: true})
    email: string;

    @Column()
    mobile: string;

    @Column()
    password: string;

    // @OneToMany(() => Category, category => category.user)
    // categories: Category[];

    @OneToMany(() => Category, category => category.user)
    categories: Category[];

    @OneToMany(() => Product, product => product.user)
    products: Product[];

    async validatePassword(password: string): Promise<boolean> {
        return bcrypt.compare(password, this.password);
    }
}
