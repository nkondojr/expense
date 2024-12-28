import { User } from 'src/users/entities/user.entity';
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
    Index
} from 'typeorm';

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

@Entity('hr_payroll_general')
@Index(['createdAt'])
export class General {
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
    @JoinColumn({ name: 'created_by' })
    createdBy: User;

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: 'updated_by' })
    updatedBy: User;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
