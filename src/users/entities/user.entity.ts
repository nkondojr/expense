import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import * as bcrypt from 'bcrypt';

@Entity()
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ nullable: false})
    full_name: string;

    @Column({ unique: true, nullable: true})
    email: string;

    @Column()
    mobile: string;

    @Column()
    password: string;

    //   @OneToMany(() => Post, post => post.user)
    //     posts: Post[];

    async validatePassword(password: string): Promise<boolean> {
        return bcrypt.compare(password, this.password);
    }
}
