import { User } from 'src/users/entities/user.entity';
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
    Index,
    OneToMany
} from 'typeorm';
import { PayrollGeneral } from './payroll-general.entity';
import { PayrollAccount } from './payroll-accounts.entity';

export enum DeductionType {
    EMPLOYEE_EARNING = 'Employee Earning',
    EMPLOYEE_STATUTORY_DEDUCTION = 'Employee Statutory Deduction',
    EMPLOYER_STATUTORY_CONTRIBUTION = 'Employer Statutory Contribution'
}

export enum DeductionNature {
    CONSTANT = 'Constant',
    PERCENTAGE = 'Percentage'
}

export enum TransactionType {
    NORMAL = 'Normal',
    PENSION = 'Pension',
    TAX = 'Tax'
}

export enum CalculatedFrom {
    BASIC_SALARY = 'Basic Salary',
    GROSS_SALARY = 'Gross Salary',
    TAXABLE_INCOME = 'Taxable Income'
}

@Entity('hr_payroll_general_deduction')
@Index(['createdAt'])
export class GeneralDeduction {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ length: 50 })
    number: string;

    @Column({ length: 100, unique: true })
    name: string;

    @Column({ type: 'enum', enum: DeductionType })
    type: DeductionType;

    @Column({ type: 'enum', enum: TransactionType })
    transactionType: TransactionType;

    @Column({ type: 'enum', enum: DeductionNature })
    nature: DeductionNature;

    @Column({ type: 'decimal', precision: 10, scale: 4 })
    value: string;

    @Column({ type: 'enum', enum: CalculatedFrom, nullable: true })
    calculateFrom: CalculatedFrom;

    @Column({ default: true })
    isActive: boolean;

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: 'createdBy' })
    createdBy: User;

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: 'updatedBy' })
    updatedBy: User;

    @CreateDateColumn({ name: 'createdAt' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updatedAt' })
    updatedAt: Date;

    @OneToMany(() => PayrollGeneral, (payrollGenerals) => payrollGenerals.generalDeduction)
    payrollGenerals: PayrollGeneral[];

    @OneToMany(() => PayrollAccount, (payrollAccounts) => payrollAccounts.generalDeduction)
    payrollAccounts: PayrollAccount[];
}
