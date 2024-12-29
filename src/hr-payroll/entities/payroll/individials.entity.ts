import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Employee } from '../employees/employees.entity';
import { User } from 'src/users/entities/user.entity';
import { CalculatedFrom, DeductionNature } from './generals.entity';

@Entity('hr_payroll_individual')
export class Individual {

    @PrimaryGeneratedColumn('uuid')
    id: string; // UUID primary key

    @Column({ length: 50 })
    number: string; // Deduction number

    @Column({ length: 100, unique: true })
    name: string; // Deduction name

    @Index()
    @ManyToOne(() => Employee, employee => employee.individuals)
    @JoinColumn({ name: 'employeeId' })
    employee: Employee; // Foreign key to Employee entity

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

    // Optional: Additional logic for default permissions can be handled via guards or roles in NestJS
}
