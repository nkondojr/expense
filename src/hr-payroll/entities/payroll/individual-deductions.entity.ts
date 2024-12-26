import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Index } from 'typeorm';
import { Payroll } from './payrolls.entity';
import { EmployeeCompensation } from './individials.entity';

@Entity('hr_payroll_individual_deduction')
// @Index('employee_compensation_index', ['employee_compensation'])
// @Index('payroll_index', ['payroll'])
export class EmployeePayrollCompensation {

    @PrimaryGeneratedColumn('uuid')
    id: string; // UUID primary key

    @ManyToOne(() => Payroll, { nullable: true, onDelete: 'SET NULL' })
    payroll: Payroll; // Foreign key to Payroll entity

    @ManyToOne(() => EmployeeCompensation, { nullable: true, onDelete: 'SET NULL' })
    employeeCompensation: EmployeeCompensation; // Foreign key to EmployeeCompensation entity

    @Column('decimal', { precision: 20, scale: 2 })
    amount: number; // Amount for employee payroll compensation

    @Column('timestamp', { default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date; // Created timestamp

    @Column('timestamp', { default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updatedAt: Date; // Updated timestamp
}
