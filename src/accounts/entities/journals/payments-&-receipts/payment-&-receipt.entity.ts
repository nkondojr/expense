import { User } from 'src/users/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToMany,
  Generated,
  JoinColumn,
} from 'typeorm';
import { PaymentAndReceiptItem } from './payment-&-receipt-item.entity';
import { Account } from '../../account.entity';

// Journal Enum
export enum Journal {
  PAYMENT = 'Payment',
  RECEIPT = 'Receipt',
}

@Entity('accounts_payment-&-receipt')
export class PaymentAndReceipt {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'uuid', unique: true })
  @Generated('uuid')
  uuid: string;

  @Column({ unique: true, nullable: false })
  rcvNumber: string;

  @Column({ type: 'date', nullable: false })
  date: Date;

  @Column('decimal', { precision: 20, scale: 4 })
  totalAmount: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  reference: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'varchar', length: 125, nullable: true })
  attachment?: string;

  @Column({ nullable: false })
  accountId: number;

  // Define the fromAccount relation
  @ManyToOne(() => Account, (account) => account.receipts, {
    eager: false,
  })
  @JoinColumn({ name: 'accountId' })
  account: Account;

  @Column({
    type: 'enum',
    enum: Journal,
  })
  type: Journal;

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

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  // REFERENCED RELATIONS
  @OneToMany(
    () => PaymentAndReceiptItem,
    (receiptItem) => receiptItem.paymentAndReceipt,
    {
      cascade: true,
      onDelete: 'CASCADE',
    },
  )
  receiptItems: PaymentAndReceiptItem[];
}
