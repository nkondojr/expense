import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Account } from '../../account.entity';
import { PaymentAndReceipt } from './payment-&-receipt.entity';

@Entity('accounts_payment-&-receipt_item')
export class PaymentAndReceiptItem {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Account, {
    eager: true,
  })
  account: Account;

  @Column('decimal', { precision: 20, scale: 4 })
  amount: string;

  @ManyToOne(
    () => PaymentAndReceipt,
    (paymentAndReceipt) => paymentAndReceipt.receiptItems,
  )
  paymentAndReceipt: PaymentAndReceipt;
}
