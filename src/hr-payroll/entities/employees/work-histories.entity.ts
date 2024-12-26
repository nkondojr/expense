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

@Entity('hr_employee_working_history')
@Index('IDX_WORK_HISTORY_EMPLOYEE', ['employee'])
export class EmployeeWorkHistory {
    @PrimaryGeneratedColumn('uuid')
    uuid: string;

    @ManyToOne(() => Employee, (employee) => employee.workHistories, {
        onDelete: 'CASCADE'
    })
    employee: Employee;

    @Column({ type: 'varchar', length: 255 })
    company: string;

    @Column({ type: 'varchar', length: 200 })
    address: string;

    @Column({ type: 'varchar', length: 200 })
    jobTitle: string;

    @Column({ type: 'date' })
    startDate: Date;

    @Column({ type: 'date', nullable: true })
    endDate: Date;

    @Column({ type: 'varchar', length: 15 })
    telephone: string;

    @Column({ type: 'varchar', length: 255 })
    email: string;

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
