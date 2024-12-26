import { Column, CreateDateColumn, Entity, Index, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Employee } from './employees.entity';
import { User } from "src/users/entities/user.entity";

@Entity('hr_employee_contract')
@Index('IDX_CONTRACT_APPOINTMENT_DATE', ['appointmentDate'])
@Index('IDX_CONTRACT_END_DATE', ['contractEndDate'])
@Index('IDX_CONTRACT_EMPLOYEE', ['employee'])
export class EmployeeContract {
    @PrimaryGeneratedColumn('uuid')
    uuid: string;

    @ManyToOne(() => Employee, (employee) => employee.contracts, {
        onDelete: 'CASCADE',
        nullable: false
    })
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

    @Column({ type: 'boolean', default: true })
    isActive: boolean;

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
}
