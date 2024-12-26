import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
    UpdateDateColumn,
    Index
} from 'typeorm';
import { Employee } from './employees.entity';
import { User } from 'src/users/entities/user.entity';

@Entity('hr_employee_bank')
@Index('IDX_EMPLOYEE_BANK_EMPLOYEE', ['employee'])
export class EmployeeBank {
    @PrimaryGeneratedColumn('uuid')
    uuid: string;

    @ManyToOne(() => Employee, (employee) => employee.banks, {
        onDelete: 'CASCADE',
        nullable: false
    })
    employee: Employee;

    @Column({ type: 'varchar', length: 255 })
    bankName: string;

    @Column({ type: 'varchar', length: 255 })
    accountName: string;

    @Column({ type: 'varchar', length: 255, unique: true })
    accountNumber: string;

    @Column({ type: 'varchar', length: 255 })
    accountBranch: string;

    @Column({ type: 'boolean', default: true })
    isActive: boolean;

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

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
