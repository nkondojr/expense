import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Index } from 'typeorm';
import { Payroll } from './payroll.entity';
import { Compensation } from './generals.entity';
import { Employee } from '../employees/employees.entity';

@Entity('hr_payroll_general_deduction')
@Index('compensation_index', ['compensation'])
@Index('employee_index', ['employee'])
@Index('payroll_index', ['payroll'])
export class PayrollCompensation {

    @PrimaryGeneratedColumn('uuid')
    id: string; // UUID primary key

    @ManyToOne(() => Payroll, { nullable: true, onDelete: 'SET NULL' })
    payroll: Payroll; // Foreign key to Payroll entity

    @ManyToOne(() => Compensation, { nullable: true, onDelete: 'SET NULL' })
    compensation: Compensation; // Foreign key to Compensation entity

    @ManyToOne(() => Employee, { nullable: true, onDelete: 'SET NULL' })
    employee: Employee; // Foreign key to Employee entity

    @Column('decimal', { precision: 20, scale: 4 })
    amount: string; // Amount for payroll compensation

    @Column('timestamp', { default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date; // Created timestamp

    @Column('timestamp', { default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updatedAt: Date; // Updated timestamp
}
