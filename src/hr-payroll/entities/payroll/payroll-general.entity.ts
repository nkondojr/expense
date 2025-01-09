import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Index, JoinColumn } from 'typeorm';
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

    @Column({ nullable: false })
    payrollId: string;

    @ManyToOne(() => Payroll, (payroll) => payroll.payrollGenerals, {
        onDelete: 'CASCADE',
        nullable: false
    })
    @JoinColumn({ name: 'payrollId' })
    payroll: Payroll;

    @Index()
    @Column({ nullable: false })
    generalId: string;

    @ManyToOne(() => GeneralDeduction, (general) => general.payrollGenerals, {
        onDelete: 'CASCADE',
        nullable: false
    })
    @JoinColumn({ name: 'generalId' })
    general: GeneralDeduction;

    @Column({ nullable: false })
    employeeId: string;

    @ManyToOne(() => Employee, (employee) => employee.payrollGenerals, {
        onDelete: 'CASCADE',
        nullable: false
    })
    @JoinColumn({ name: 'employeeId' })
    employee: Employee;

    @Column('decimal', { precision: 20, scale: 4 })
    amount: string; // Amount for payroll general

    @Column('timestamp', { default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date; // Created timestamp

    @Column('timestamp', { default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updatedAt: Date; // Updated timestamp
}
