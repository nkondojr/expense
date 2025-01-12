import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Index } from 'typeorm';
import { Payroll } from './payroll.entity';
import { Employee } from '../employees/employees.entity';

@Entity('hr_payroll_item')
export class PayrollItem {

    @PrimaryGeneratedColumn('uuid')
    id: string; // UUID primary key

    @Column('decimal', { precision: 20, scale: 4, default: 0 })
    totalCost: string; // Total cost for the employee payroll item

    @Column('decimal', { precision: 20, scale: 4, default: 0 })
    grossSalary: string; // Gross salary

    @Column('decimal', { precision: 20, scale: 4, default: 0 })
    basicSalary: string; // Basic salary

    @Column('decimal', { precision: 20, scale: 4, default: 0 })
    taxableIncome: string; // Taxable income

    @Column('decimal', { precision: 20, scale: 4, default: 0 })
    netSalary: string; // Net salary

    @Column('timestamp', { default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date; // Created timestamp

    @Column('timestamp', { default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updatedAt: Date; // Updated timestamp

    @Index()
    @ManyToOne(() => Payroll, payroll => payroll.payrollItems, { onDelete: 'CASCADE' })
    payroll: Payroll;

    @Index()
    @ManyToOne(() => Employee, { eager: true })  // Ensure employee is loaded eagerly
    employee: Employee;
}
