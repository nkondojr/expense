import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Index } from 'typeorm';
import { Payroll } from './payroll.entity';
import { IndividualDeduction } from './individial-deductions.entity';

@Entity('hr_payroll_individual')
@Index('employee_general_index', ['individualDeduction'])
export class PayrollIndividual {

    @PrimaryGeneratedColumn('uuid')
    id: string; // UUID primary key

    @Index()
    @ManyToOne(() => Payroll, { nullable: true, onDelete: 'SET NULL' })
    payroll: Payroll; // Foreign key to Payroll entity

    @ManyToOne(() => IndividualDeduction, { nullable: true, onDelete: 'SET NULL' })
    individualDeduction: IndividualDeduction; // Foreign key to Individual entity

    @Column('decimal', { precision: 20, scale: 4 })
    amount: string; // Amount for employee payroll general

    @Column('timestamp', { default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date; // Created timestamp

    @Column('timestamp', { default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updatedAt: Date; // Updated timestamp
}
