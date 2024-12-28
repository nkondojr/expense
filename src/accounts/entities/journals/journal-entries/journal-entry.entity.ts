import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  Index,
  Generated,
} from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { JournalEntryItem } from './journal-entry-item.entity';

@Entity('accounts_journal_entry')
export class JournalEntry {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'uuid', unique: true })
  @Generated('uuid')
  uuid: string;

  @Column({ length: 25, unique: true, nullable: false })
  jeNumber: string;

  @Column({ type: 'date', nullable: false })
  date: Date;

  @Column('decimal', { precision: 20, scale: 4 })
  totalAmount: string;

  @Column({ type: 'text', nullable: true })
  comment?: string;

  @Column({ type: 'varchar', length: 125, nullable: true })
  attachment: string;

  @Column({ default: 'Pending' })
  status: string; // Status of the bank transfer (e.g., Pending, Approved, etc.)

  @Index()
  @Column({ default: false })
  isApproved: boolean;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  approvedBy: User;

  @Column({ type: 'timestamp', nullable: true })
  approvedAt: Date;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  createdBy: User;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  updatedBy: User;

  @Index()
  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  // REFERENCED RELATIONS
  @OneToMany(() => JournalEntryItem, (jeItem) => jeItem.journalEntry, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  jeItems: JournalEntryItem[];
}
