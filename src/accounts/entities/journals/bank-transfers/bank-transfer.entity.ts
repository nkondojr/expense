import { User } from 'src/users/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  Generated,
  JoinColumn,
} from 'typeorm';
import { Account } from '../../account.entity';

@Entity('accounts_bank_transfer')
export class BankTransfer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'uuid', unique: true })
  @Generated('uuid')
  uuid: string;

  @Column({ type: 'varchar', length: 10 })
  cvNumber: string;

  @Column({ type: 'date' })
  date: Date;

  @Column({ type: 'varchar', length: 100, unique: true })
  reference: string;

  @Column('decimal', { precision: 20, scale: 4 })
  amount: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'varchar', length: 125, nullable: true })
  attachment?: string;

  @Column({ nullable: false })
  fromAccountId: number;

  // Define the fromAccount relation
  @ManyToOne(() => Account, (account) => account.fromTransfers, {
    eager: false,
  })
  @JoinColumn({ name: 'fromAccountId' })
  fromAccount: Account;

  @Column({ nullable: false })
  toAccountId: number;

  // Define the toAccount relation
  @ManyToOne(() => Account, (account) => account.toTransfers, { eager: false })
  @JoinColumn({ name: 'toAccountId' })
  toAccount: Account;

  @Column({ default: 'Pending' })
  status: string; // Status of the bank transfer (e.g., Pending, Approved, etc.)

  @Index()
  @Column({ type: 'boolean', default: false })
  isApproved: boolean;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  approvedBy?: User;

  @Column({ type: 'timestamp', nullable: true })
  approvedAt?: Date;

  @Index()
  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  createdBy?: User;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  updatedBy?: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
