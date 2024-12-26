import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Index } from 'typeorm';
import { Payroll } from './payrolls.entity';
import { Employee } from '../employees/employees.entity';

@Entity('hr_payroll_item')
// @Index('employee_index', ['employee'])
// @Index('payroll_index', ['payroll'])
export class PayrollItem {

    @PrimaryGeneratedColumn('uuid')
    // id: string; // UUID primary key

    @ManyToOne(() => Payroll, { nullable: true, onDelete: 'SET NULL' })
    payroll: Payroll; // Foreign key to Payroll entity

    @ManyToOne(() => Employee, { nullable: true, onDelete: 'SET NULL' })
    employee: Employee; // Foreign key to Employee entity

    // @ManyToOne(() => Payroll, (payroll) => payroll.payrollItems, {
    //     nullable: false,
    //     onDelete: 'CASCADE'
    // })
    // payroll: Payroll;

    // @ManyToOne(() => Employee, (employee) => employee.payrollItems, {
    //     nullable: false,
    //     onDelete: 'CASCADE'
    // })
    // employee: Employee;

    @Column('decimal', { precision: 20, scale: 2 })
    totalCost: number; // Total cost for the employee payroll item

    @Column('decimal', { precision: 20, scale: 2 })
    grossSalary: number; // Gross salary

    @Column('decimal', { precision: 20, scale: 2 })
    basicSalary: number; // Basic salary

    @Column('decimal', { precision: 20, scale: 2 })
    taxableIncome: number; // Taxable income

    @Column('decimal', { precision: 20, scale: 2 })
    netSalary: number; // Net salary

    @Column('timestamp', { default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date; // Created timestamp

    @Column('timestamp', { default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updatedAt: Date; // Updated timestamp
}
