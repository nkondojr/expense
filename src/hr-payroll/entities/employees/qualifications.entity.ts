import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { Employee } from './employees.entity';
import { User } from 'src/users/entities/user.entity';

export enum GradeType {
    GPA = 'GPA',
    DIVISION = 'Division',
    PASS = 'Pass',
}

export enum QualificationType {
    ACADEMIC = 'Academic',
    PROFESSIONAL = 'Professional',
}

@Entity('hr_employee_qualification')
@Index(['employee'])
export class Qualification {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ nullable: false })
    employeeId: string;

    @ManyToOne(() => Employee, (employee) => employee.employeeBanks, {
        onDelete: 'CASCADE',
        nullable: false
    })
    @JoinColumn({ name: 'employeeId' })
    employee: Employee;

    @Column({ type: 'enum', enum: QualificationType })
    type: QualificationType;

    @Column({ type: 'varchar', length: 255, nullable: true })
    educationLevel: string;

    @Column({ type: 'varchar', length: 255 })
    institutionName: string;

    @Column({ type: 'varchar', length: 255 })
    country: string;

    @Column({ type: 'varchar', length: 255 })
    programName: string;

    @Column({ type: 'date' })
    startDate: Date;

    @Column({ type: 'date' })
    endDate: Date;

    @Column({ type: 'date', nullable: true })
    dateAwarded: Date;

    @Column({ type: 'varchar', length: 255, nullable: true })
    attachment: string;

    @Column({ type: 'enum', enum: GradeType })
    gradeType: GradeType;

    @Column({ type: 'varchar', length: 30, nullable: true })
    grade: string;

    @Column({ type: 'varchar', length: 20, nullable: true })
    gradePoints: string;

    @ManyToOne(() => User, { onDelete: 'SET NULL' })
    @JoinColumn({ name: 'createdBy' })
    createdBy: User;

    @ManyToOne(() => User, { onDelete: 'SET NULL' })
    @JoinColumn({ name: 'updatedBy' })
    updatedBy: User;

    @CreateDateColumn({ name: 'createdAt' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updatedAt' })
    updatedAt: Date;
}
