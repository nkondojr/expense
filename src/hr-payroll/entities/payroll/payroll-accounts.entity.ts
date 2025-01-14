import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToOne, JoinColumn, Index } from 'typeorm';
import { GeneralDeduction } from './general-deductions.entity';
import { IndividualDeduction } from './individial-deductions.entity';
import { Account } from 'src/accounts/entities/account.entity';

@Entity('hr_payroll_account')
@Index('deduction_account_index', ['generalDeduction', 'individualDeduction']) // Optional: Index for general and individual fields
export class PayrollAccount {

    @PrimaryGeneratedColumn('uuid')
    id: string; // UUID primary key

    @Column({ length: 30, enum: ['General', 'Individual'] })
    type: 'General' | 'Individual'; // Type of deduction account

    @Index()
    @Column({ nullable: true })
    generalDeductionId: string;

    @ManyToOne(() => GeneralDeduction, (generalDeduction) => generalDeduction.payrollAccounts, {
        onDelete: 'CASCADE',
        nullable: true
    })
    @JoinColumn({ name: 'generalDeductionId' })
    generalDeduction: GeneralDeduction;

    @Index()
    @Column({ nullable: true })
    individualDeductionId: string;

    @ManyToOne(() => IndividualDeduction, (individualDeduction) => individualDeduction.payrollAccounts, {
        onDelete: 'CASCADE',
        nullable: true
    })
    @JoinColumn({ name: 'individualDeductionId' })
    individualDeduction: IndividualDeduction;

    @Index()
    @ManyToOne(() => Account, { eager: true })  // Ensure product is loaded eagerly
    liabilityAccount: Account;

    @Index()
    @ManyToOne(() => Account, { eager: true })  // Ensure product is loaded eagerly
    expenseAccount: Account;

    @Column('timestamp', { default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date; // Created timestamp

    @Column('timestamp', { default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updatedAt: Date; // Updated timestamp

    // Optional: Additional logic for default permissions can be handled via guards or roles in NestJS
}
