import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  Index,
} from 'typeorm';
import { Account } from '../../account.entity';
import { JournalEntry } from './journal-entry.entity';

@Entity('accounts_journal_entry_item')
export class JournalEntryItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @ManyToOne(() => Account, { nullable: true, onDelete: 'SET NULL' })
  creditAccount: Account;

  @Index()
  @ManyToOne(() => Account, { nullable: true, onDelete: 'SET NULL' })
  debtAccount: Account;

  @Column('decimal', { precision: 20, scale: 4 })
  amount: string;

  @Index()
  @ManyToOne(() => JournalEntry, (journalEntry) => journalEntry.jeItems, {
    onDelete: 'CASCADE',
  })
  journalEntry: JournalEntry;
}
