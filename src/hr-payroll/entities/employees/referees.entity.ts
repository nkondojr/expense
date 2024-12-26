import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
    UpdateDateColumn,
    Index
} from 'typeorm';
import { Employee, EmployeeTitle } from './employees.entity';
import { User } from 'src/users/entities/user.entity';

@Entity('hr_employee_referee')
export class EmployeeReferee {
    @PrimaryGeneratedColumn('uuid')
    uuid: string;

    @ManyToOne(() => Employee, (employee) => employee.referees, {
        nullable: false,
        onDelete: 'CASCADE'
    })
    employee: Employee;

    @Column({ type: 'varchar', length: 100 })
    name: string;

    @Column({ type: 'varchar', length: 100 })
    address: string;

    @Column({ type: 'varchar', length: 12 })
    mobile: string;

    // @Column({
    //     type: 'enum',
    //     enum: EmployeeTitle,
    //     nullable: false
    // })
    // title: EmployeeTitle;

    @Column({
        type: 'enum',
        enum: ['Mr', 'Mrs', 'Ms', 'Prof', 'Dr', 'Miss'],
        nullable: true
    })
    title: string;

    @Column({ type: 'varchar', unique: true })
    email: string;

    @Column({ type: 'varchar', length: 200 })
    organisation: string;

    @ManyToOne(() => User, {
        nullable: true,
        onDelete: 'SET NULL'
    })
    createdBy: User;

    @ManyToOne(() => User, {
        nullable: true,
        onDelete: 'SET NULL'
    })
    updatedBy: User;

    @Index()
    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
