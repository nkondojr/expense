import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
    UpdateDateColumn,
    Index,
    JoinColumn,
} from 'typeorm';
import { Employee } from './employees.entity';
import { User } from 'src/users/entities/user.entity';

@Entity('hr_employee_allocation')
@Index('IDX_ALLOCATION_EMPLOYEE', ['employee'])
export class Allocation {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ nullable: false })
    employeeId: string;

    @ManyToOne(() => Employee, (employee) => employee.allocations, {
        onDelete: 'CASCADE',
        nullable: false
    })
    @JoinColumn({ name: 'employeeId' })
    employee: Employee;

    @Column({ type: 'varchar', length: 200 })
    department: string;

    @Column({ type: 'varchar', length: 255 })
    jobTitle: string;

    @Column({ type: 'decimal', precision: 20, scale: 4 })
    basicSalary: string;

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
