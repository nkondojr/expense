import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToOne, JoinColumn, Index } from 'typeorm';
import { Compensation } from './generals.entity';
import { EmployeeCompensation } from './individials.entity';
import { Payroll } from './payrolls.entity';

@Entity('hr_payroll_account')
@Index('compensation_account_index', ['generalCompensation', 'individualCompensation']) // Optional: Index for generalCompensation and individualCompensation fields
export class PayrollAccount {

    @PrimaryGeneratedColumn('uuid')
    id: string; // UUID primary key

    @Column({ length: 30, enum: ['General', 'Individual'] })
    type: 'General' | 'Individual'; // Type of compensation account

    @OneToOne(() => Compensation, { nullable: true })
    @JoinColumn({ name: 'general_compensation_id' })
    generalCompensation: Compensation; // One-to-one relationship with Compensation (for general compensation)

    @OneToOne(() => EmployeeCompensation, { nullable: true })
    @JoinColumn({ name: 'individual_compensation_id' })
    individualCompensation: EmployeeCompensation; // One-to-one relationship with EmployeeCompensation (for individual compensation)

    // @ManyToOne(() => Account, { nullable: true })
    // @JoinColumn({ name: 'liability_account_id' })
    // liabilityAccount: Account; // Foreign key to Account for liability account

    // @ManyToOne(() => Account, { nullable: true })
    // @JoinColumn({ name: 'expense_account_id' })
    // expenseAccount: Account; // Foreign key to Account for expense account

    @Column('timestamp', { default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date; // Created timestamp

    @Column('timestamp', { default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updatedAt: Date; // Updated timestamp

    // Optional: Additional logic for default permissions can be handled via guards or roles in NestJS
}
