import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Employee } from '../employees/employees.entity';
import { User } from 'src/users/entities/user.entity';
import { CalculatedFrom, CompensationNature } from './generals.entity';

@Entity('hr_payroll_individual')
export class EmployeeCompensation {

    @PrimaryGeneratedColumn('uuid')
    id: string; // UUID primary key

    @Column({ length: 50 })
    number: string; // Compensation number

    @Column({ length: 100, unique: true })
    name: string; // Compensation name

    @Index()
    @ManyToOne(() => Employee, employee => employee.employee_individual_compensations)
    @JoinColumn({ name: 'employee_id' })
    employee: Employee; // Foreign key to Employee entity

    @Column('decimal', { precision: 10, scale: 4 })
    value: string; // Compensation value

    @Column('date')
    effectiveDate: string; // Effective date of the compensation

    @Column('int')
    deductionPeriod: number; // Deduction period

    @Column({ length: 50, enum: ['Employee Deduction', 'Employee Earning'] })
    type: 'Employee Deduction' | 'Employee Earning'; // Type of compensation

    @Column({ type: 'enum', enum: CompensationNature })
    nature: CompensationNature;

    @Column({ type: 'enum', enum: CalculatedFrom })
    calculateFrom: CalculatedFrom;

    @Column({ default: true })
    isActive: boolean; // Whether the compensation is active

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: 'created_by' })
    createdBy: User; // User who created the compensation

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: 'updated_by' })
    updatedBy: User; // User who updated the compensation

    @Column('timestamp', { default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date; // Created timestamp

    @Column('timestamp', { default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updatedAt: Date; // Updated timestamp

    // Optional: Additional logic for default permissions can be handled via guards or roles in NestJS
}
