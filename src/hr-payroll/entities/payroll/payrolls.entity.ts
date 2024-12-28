import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, ManyToMany, JoinTable, OneToOne, JoinColumn, Index, OneToMany } from 'typeorm';
import { Employee } from '../employees/employees.entity';
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

    @ManyToOne(() => FinancialYear, { nullable: true })
    @JoinColumn({ name: 'financial_year_id' })
    financialYear: FinancialYear; // Foreign key to FinancialYear entity

    @Column({ length: 20, enum: ['Initialized', 'Approved', 'Paid'], default: 'Initialized' })
    status: 'Initialized' | 'Approved' | 'Paid'; // Payroll status

    @ManyToMany(() => Employee)
    @JoinTable({
        name: 'payroll_employees', // Many-to-many relation table
        joinColumn: { name: 'payroll_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'employee_id', referencedColumnName: 'id' },
    })
    employees: Employee[]; // Many-to-many relationship with Employee entity

    @Column('date')
    date: string; // Payroll date

    @Column('decimal', { precision: 20, scale: 4, default: 0 })
    totalCost: string; // Total cost of payroll

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: 'created_by_id' })
    createdBy: User; // User who created the payroll

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: 'updated_by_id' })
    updatedBy: User; // User who updated the payroll

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: 'approved_by_id' })
    approvedBy: User; // User who approved the payroll

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: 'paid_by_id' })
    paidBy: User; // User who paid the payroll

    @Column('date', { nullable: true })
    paidAt: string; // Date when payroll was paid

    @Column('date', { nullable: true })
    approvedAt: string; // Date when payroll was approved

    @Column('timestamp', { default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date; // Created timestamp

    @Column('timestamp', { default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updatedAt: Date; // Updated timestamp

    // Generate payroll number logic (in service or before insert)
    static generatePayrollNumber(): string {
        // Logic to generate payroll number similar to the Django model (for service implementation)
        return 'PAYRL-0001'; // Placeholder for the actual logic
    }
}
