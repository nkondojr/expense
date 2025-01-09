import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToOne, JoinColumn, Index } from 'typeorm';
import { GeneralDeduction } from './general-deductions.entity';
import { IndividualDeduction } from './individial-deductions.entity';
import { Account } from 'src/accounts/entities/account.entity';

@Entity('hr_payroll_account')
@Index('deduction_account_index', ['general', 'individual']) // Optional: Index for general and individual fields
export class PayrollAccount {

    @PrimaryGeneratedColumn('uuid')
    id: string; // UUID primary key

    @Column({ length: 30, enum: ['General', 'Individual'] })
    type: 'General' | 'Individual'; // Type of deduction account

    @OneToOne(() => GeneralDeduction, { nullable: true })
    @JoinColumn({ name: 'generalId' })
    general: GeneralDeduction; // One-to-one relationship with deduction (for general deduction)

    @OneToOne(() => IndividualDeduction, { nullable: true })
    @JoinColumn({ name: 'individualId' })
    individual: IndividualDeduction; // One-to-one relationship with Individual (for individual deduction)

    @ManyToOne(() => Account, { nullable: true })
    @JoinColumn({ name: 'liabilityAccountId' })
    liabilityAccount: Account; // Foreign key to Account for liability account

    @ManyToOne(() => Account, { nullable: true })
    @JoinColumn({ name: 'expenseAccountId' })
    expenseAccount: Account; // Foreign key to Account for expense account

    @Column('timestamp', { default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date; // Created timestamp

    @Column('timestamp', { default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updatedAt: Date; // Updated timestamp

    // Optional: Additional logic for default permissions can be handled via guards or roles in NestJS
}
