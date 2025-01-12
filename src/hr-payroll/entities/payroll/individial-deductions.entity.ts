import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Index, OneToMany } from 'typeorm';
import { Employee } from '../employees/employees.entity';
import { User } from 'src/users/entities/user.entity';
import { CalculatedFrom, DeductionNature } from './general-deductions.entity';
import { PayrollAccount } from './payroll-accounts.entity';

@Entity('hr_payroll_individual_deduction')
export class IndividualDeduction {

    @PrimaryGeneratedColumn('uuid')
    id: string; // UUID primary key

    @Column({ length: 50 })
    number: string; // Deduction number

    @Column({ length: 100, unique: true })
    name: string; // Deduction name

    @Index()
    @Column({ nullable: false })
    employeeId: string;

    @ManyToOne(() => Employee, (employee) => employee.individuals, {
        onDelete: 'CASCADE',
        nullable: false
    })
    @JoinColumn({ name: 'employeeId' })
    employee: Employee;

    @Column('decimal', { precision: 10, scale: 4 })
    value: string; // Deduction value

    @Column('date')
    effectiveDate: string; // Effective date of the deduction

    @Column('int')
    deductionPeriod: number; // Deduction period

    @Column({ length: 50, enum: ['Employee Deduction', 'Employee Earning'] })
    type: 'Employee Deduction' | 'Employee Earning'; // Type of deduction

    @Column({ type: 'enum', enum: DeductionNature })
    nature: DeductionNature;

    @Column({ type: 'enum', enum: CalculatedFrom })
    calculateFrom: CalculatedFrom;

    @Column({ default: true })
    isActive: boolean; // Whether the deduction is active

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: 'createdBy' })
    createdBy: User; // User who created the deduction

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: 'updatedBy' })
    updatedBy: User; // User who updated the deduction

    @Column('timestamp', { default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date; // Created timestamp

    @Column('timestamp', { default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updatedAt: Date; // Updated timestamp

    @OneToMany(() => PayrollAccount, (payrollAccounts) => payrollAccounts.individual)
    payrollAccounts: PayrollAccount[];

    // Optional: Additional logic for default permissions can be handled via guards or roles in NestJS
}
