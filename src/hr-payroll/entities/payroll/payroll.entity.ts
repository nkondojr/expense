import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, ManyToMany, JoinTable, JoinColumn, Index, OneToMany } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { FinancialYear } from 'src/organizations/entities/financial-years/financial-year.entity';
import { PayrollItem } from './payroll-items.entity';

@Entity('hr_payroll')
@Index('payroll_status_index', ['status'])
@Index('payroll_financial_year_index', ['financialYear'])
export class Payroll {

    @PrimaryGeneratedColumn('uuid')
    id: string; // UUID primary key

    @Column({ length: 20, unique: true })
    number: string; // Payroll number

    @Column({ type: 'date' })
    date: Date;

    @ManyToOne(() => FinancialYear, { nullable: true })
    @JoinColumn({ name: 'financialYearId' })
    financialYear: FinancialYear; // Foreign key to FinancialYear entity

    @Column('decimal', { precision: 20, scale: 4, default: 0 })
    totalCost: string; // Total cost of payroll

    @Column({ length: 20, enum: ['Initialized', 'Approved', 'Paid'], default: 'Initialized' })
    status: 'Initialized' | 'Approved' | 'Paid'; // Payroll status

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: 'createdById' })
    createdBy: User; // User who created the payroll

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: 'updatedById' })
    updatedBy: User; // User who updated the payroll

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: 'approvedById' })
    approvedBy: User; // User who approved the payroll

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: 'paidById' })
    paidBy: User; // User who paid the payroll

    @Column('date', { nullable: true })
    paidAt: string; // Date when payroll was paid

    @Column('date', { nullable: true })
    approvedAt: string; // Date when payroll was approved

    @Column('timestamp', { default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date; // Created timestamp

    @Column('timestamp', { default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updatedAt: Date; // Updated timestamp

    @OneToMany(() => PayrollItem, (payrollItems) => payrollItems.payroll)
    payrollItems: PayrollItem[];

    // Generate payroll number logic (in service or before insert)
    static generatePayrollNumber(): string {
        // Logic to generate payroll number similar to the Django model (for service implementation)
        return 'PAYRL-0001'; // Placeholder for the actual logic
    }
}
