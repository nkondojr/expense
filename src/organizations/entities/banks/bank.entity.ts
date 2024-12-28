import { User } from 'src/users/entities/user.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  Index,
  Generated,
  OneToOne,
} from 'typeorm';
import { Organization } from '../organization.entity';
import { Account } from 'src/accounts/entities/account.entity';

@Entity('organization_bank')
export class Bank {
  @PrimaryGeneratedColumn()
  id: number; // Auto-incremented integer ID

  @Column({ type: 'uuid', unique: true })
  @Generated('uuid')
  uuid: string; // Auto-generated unique UUID

  @Column({ length: 50 })
  bankName: string;

  @Column({ length: 100 })
  accountName: string;

  @Column({ unique: true, length: 17 })
  accountNumber: string;

  @Column({ length: 50 })
  accountBranch: string;

  @Column({ default: true })
  isActive: boolean;

  @Index()
  @ManyToOne(() => Organization, (organization) => organization.banks, {
    onDelete: 'CASCADE',
  })
  organization: Organization;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  createdBy: User;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  updatedBy: User;

  @Index()
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne(() => Account, (account) => account.bankDetails, { nullable: true })
  account?: Account;
}
