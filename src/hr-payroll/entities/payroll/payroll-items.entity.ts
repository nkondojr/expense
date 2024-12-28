import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Index } from 'typeorm';
import { Payroll } from './payroll.entity';
import { Employee } from '../employees/employees.entity';

@Entity('hr_payroll_item')
export class PayrollItem {

    @PrimaryGeneratedColumn('uuid')
    id: string; // UUID primary key

    @Index()
    @ManyToOne(() => Payroll, { nullable: true, onDelete: 'SET NULL' })
    payroll: Payroll; // Foreign key to Payroll entity

    @Index()
    @ManyToOne(() => Employee, { nullable: true, onDelete: 'SET NULL' })
    employee: Employee; // Foreign key to Employee entity

    @Column('decimal', { precision: 20, scale: 4 })
    totalCost: string; // Total cost for the employee payroll item

    @Column('decimal', { precision: 20, scale: 4 })
    grossSalary: string; // Gross salary

    @Column('decimal', { precision: 20, scale: 4 })
    basicSalary: string; // Basic salary

    @Column('decimal', { precision: 20, scale: 4 })
    taxableIncome: string; // Taxable income

    @Column('decimal', { precision: 20, scale: 4 })
    netSalary: string; // Net salary

    @Column('timestamp', { default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date; // Created timestamp

    @Column('timestamp', { default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updatedAt: Date; // Updated timestamp
}
