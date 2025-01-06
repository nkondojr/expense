import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Employee } from './employees.entity';
import { User } from "src/users/entities/user.entity";

export enum EndReason {
    ENDOFCONTRACT = 'End Of Contract',
    RESIGNATION = 'Resignation',
    RETIREMENT = 'Retirement',
    TERMINATION = 'Termination',
    DEATH = 'Death'
}

@Entity('hr_employee_contract')
@Index('IDX_CONTRACT_APPOINTMENT_DATE', ['appointmentDate'])
@Index('IDX_CONTRACT_END_DATE', ['contractEndDate'])
@Index('IDX_CONTRACT_EMPLOYEE', ['employee'])
export class Contract {
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

    @Column({ type: 'date' })
    appointmentDate: Date;

    @Column({ type: 'date' })
    contractEndDate: Date;

    @Column({ type: 'date', nullable: true })
    retirementDate: Date;

    @Column({
        type: 'enum',
        enum: ['End of Contract', 'Resignation', 'Retirement', 'Termination', 'Death'],
        nullable: true
    })
    endOfContractReason: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    attachment: string;

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
}
