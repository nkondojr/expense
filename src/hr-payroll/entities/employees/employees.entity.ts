import { User } from 'src/users/entities/user.entity';
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    OneToOne,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
    Index,
    OneToMany
} from 'typeorm';
import { EmployeeReferee } from './referees.entity';
import { EmployeeContract } from './contracts.entity';
import { EmployeeAllocation } from './allocations.entity';
import { EmployeeBank } from './banks.entity';
import { EmployeeQualification } from './qualifications.entity';
import { EmployeeNextOfKin } from './next-of-kins.entity';
import { EmployeeWorkHistory } from './work-histories.entity';
import { Individual } from '../payroll/individials.entity';

export enum IDType {
    NIDA = 'Nida',
    VOTERS = 'Voters',
    PASSPORT = 'Passport',
    DRIVING_LICENSE = 'Driving Licence'
}

export enum MaritalStatus {
    SINGLE = 'Single',
    MARRIED = 'Married',
    DIVORCED = 'Divorced'
}

export enum EmploymentType {
    INTERNSHIP = 'Internship',
    CONTRACT = 'Contract',
    PERMANENT = 'Permanent',
    TEMPORARY = 'Temporary'
}

export enum EmployeeTitle {
    MR = 'Mr',
    MRS = 'Mrs',
    MS = 'Ms',
    PROF = 'Prof',
    DR = 'Dr',
    MISS = 'Miss'
}

@Entity('hr_employee')
@Index('IDX_EMPLOYEE_CREATED_AT', ['createdAt'])
@Index('IDX_EMPLOYEE_REGISTRATION_NUMBER', ['regNumber'])
export class Employee {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({
        type: 'enum',
        enum: EmployeeTitle,
        nullable: false
    })
    title: EmployeeTitle;

    @OneToOne(() => User, (user) => user.employeeInfo, {
        onDelete: 'CASCADE',
    })
    @JoinColumn()
    user: User;

    @Column({ type: 'date', nullable: false })
    dob: Date;

    @Column({ type: 'varchar', length: 20, nullable: true })
    placeOfBirth: string;

    @Column({
        type: 'enum',
        enum: MaritalStatus,
        nullable: false
    })
    maritalStatus: MaritalStatus;

    @Column({
        type: 'enum',
        enum: EmploymentType,
        nullable: false
    })
    employmentType: EmploymentType;

    @Column({
        type: 'enum',
        enum: IDType,
        nullable: false
    })
    idType: IDType;

    @Column({ type: 'varchar', length: 100, unique: true })
    idNumber: string;

    @Column({ type: 'varchar', length: 50, unique: true })
    regNumber: string;

    @Column({ type: 'bigint', unique: true, nullable: true })
    tin: number;

    @Column({ type: 'date', nullable: true })
    employmentDate: Date;

    @Column({ type: 'varchar', length: 20, unique: true, nullable: true })
    employmentNumber: string;

    @Column({ type: 'varchar', length: 50, unique: true, nullable: true })
    pensionNumber: string;

    @Column({ type: 'varchar', length: 50 })
    region: string;

    @Column({ type: 'varchar', length: 50 })
    district: string;

    @Column({ type: 'varchar', length: 50, nullable: true })
    ward: string;

    @Column({ type: 'varchar', length: 100, nullable: true })
    street: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    attachment: string; // File path, handle file uploads separately

    @ManyToOne(() => User, {
        nullable: true,
        onDelete: 'SET NULL'
    })
    createdBy: User;

    @ManyToOne(() => User, {
        nullable: true,
        onDelete: 'SET NULL'
    })
    updatedBy: User;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @Column({ type: 'boolean', default: true })
    isActive: boolean;

    @OneToMany(() => EmployeeReferee, referees => referees.employee)
    referees: EmployeeReferee[];

    @OneToMany(() => EmployeeContract, contracts => contracts.employee)
    contracts: EmployeeContract[];

    @OneToMany(() => EmployeeAllocation, allocations => allocations.employee)
    allocations: EmployeeAllocation[];

    @OneToMany(() => EmployeeBank, banks => banks.employee)
    banks: EmployeeBank[];

    @OneToMany(() => EmployeeQualification, qualifications => qualifications.employee)
    qualifications: EmployeeQualification[];

    @OneToMany(() => EmployeeNextOfKin, nextOfKins => nextOfKins.employee)
    nextOfKins: EmployeeNextOfKin[];

    @OneToMany(() => EmployeeWorkHistory, workHistories => workHistories.employee)
    workHistories: EmployeeWorkHistory[];

    @OneToMany(() => Individual, individuals => individuals.employee)
    individuals: Individual[];

    // getFullName(): string {
    //     return `${this.user.firstName} ${this.user.middleName || ''} ${this.user.lastName}`.trim();
    // }
}
