import { User } from 'src/users/entities/user.entity';
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
import { AccountType } from './class.entity';
import { Account } from './account.entity';
import { Length } from 'class-validator';

// Mode Enum
export enum Mode {
  COLLECTION = 'Collection',
  OPERATION = 'Operation',
}

@Entity('accounts_group')
export class Group {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'uuid', unique: true })
  @Generated('uuid')
  uuid: string;

  @Column({ length: 200 })
  @Length(1, 100)
  name: string;

  @Column({ unique: true, length: 25 })
  code: string;

  @Column({
    type: 'enum',
    enum: Mode,
  })
  mode: Mode;

  @Column({
    type: 'enum',
    enum: AccountType,
  })
  type: AccountType;

  @Column({ default: true })
  isEditable: boolean;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  createdBy: User;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  updatedBy: User;

  @Index()
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  //Referenced Relationships
  @OneToMany(() => Account, (account) => account.group)
  accounts: Account[];
}
