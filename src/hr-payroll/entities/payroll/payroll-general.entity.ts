import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Index } from 'typeorm';
import { Payroll } from './payroll.entity';
import { Employee } from '../employees/employees.entity';
import { GeneralDeduction } from './general-deductions.entity';

@Entity('hr_payroll_general')
@Index('general_index', ['general'])
@Index('employee_index', ['employee'])
@Index('payroll_index', ['payroll'])
export class PayrollGeneral {

    @PrimaryGeneratedColumn('uuid')
    id: string; // UUID primary key

    @ManyToOne(() => Payroll, { nullable: true, onDelete: 'SET NULL' })
    payroll: Payroll; // Foreign key to Payroll entity

    @ManyToOne(() => GeneralDeduction, { nullable: true, onDelete: 'SET NULL' })
    general: GeneralDeduction; // Foreign key to GeneralDeduction entity

    @ManyToOne(() => Employee, { nullable: true, onDelete: 'SET NULL' })
    employee: Employee; // Foreign key to Employee entity

    @Column('decimal', { precision: 20, scale: 4 })
    amount: string; // Amount for payroll general

    @Column('timestamp', { default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date; // Created timestamp

    @Column('timestamp', { default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updatedAt: Date; // Updated timestamp
}
