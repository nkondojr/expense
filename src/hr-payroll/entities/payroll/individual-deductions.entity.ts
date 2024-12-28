import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Index } from 'typeorm';
import { Payroll } from './payroll.entity';
import { Individual } from './individials.entity';

@Entity('hr_payroll_individual_deduction')
@Index('employee_general_index', ['individual'])
export class PayrollIndividual {

    @PrimaryGeneratedColumn('uuid')
    id: string; // UUID primary key

    @Index()
    @ManyToOne(() => Payroll, { nullable: true, onDelete: 'SET NULL' })
    payroll: Payroll; // Foreign key to Payroll entity

    @ManyToOne(() => Individual, { nullable: true, onDelete: 'SET NULL' })
    individual: Individual; // Foreign key to Individual entity

    @Column('decimal', { precision: 20, scale: 4 })
    amount: string; // Amount for employee payroll general

    @Column('timestamp', { default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date; // Created timestamp

    @Column('timestamp', { default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updatedAt: Date; // Updated timestamp
}
