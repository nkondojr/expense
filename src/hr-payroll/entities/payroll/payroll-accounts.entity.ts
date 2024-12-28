import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToOne, JoinColumn, Index } from 'typeorm';
import { General } from './generals.entity';
import { Individual } from './individials.entity';

@Entity('hr_payroll_account')
@Index('deduction_account_index', ['general', 'individual']) // Optional: Index for general and individual fields
export class PayrollAccount {

    @PrimaryGeneratedColumn('uuid')
    id: string; // UUID primary key

    @Column({ length: 30, enum: ['General', 'Individual'] })
    type: 'General' | 'Individual'; // Type of deduction account

    @OneToOne(() => General, { nullable: true })
    @JoinColumn({ name: 'general_id' })
    general: General; // One-to-one relationship with deduction (for general deduction)

    @OneToOne(() => Individual, { nullable: true })
    @JoinColumn({ name: 'individual_id' })
    individual: Individual; // One-to-one relationship with Individual (for individual deduction)

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
