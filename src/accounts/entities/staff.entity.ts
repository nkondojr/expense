import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  Generated,
  Index,
} from 'typeorm';
import { User } from 'src/users/entities/user.entity';

@Entity('acounts_staff')
export class Staff {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'uuid', unique: true })
  @Generated('uuid')
  uuid: string;

  @Column({ unique: true, length: 25, nullable: false })
  empNo: string;

  @Column({ length: 25, nullable: false })
  firstName: string;

  @Column({ length: 25, nullable: false })
  lastName: string;

  @Column({ type: 'varchar', length: 100, unique: true, nullable: false })
  email: string;

  @Column({ type: 'bigint', unique: true, nullable: false })
  mobile: number;

  @Column('decimal', { precision: 20, scale: 4, default: 0 })
  balance: string;

  @ManyToOne(() => User, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  createdBy: User;

  @ManyToOne(() => User, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  updatedBy: User;

  @CreateDateColumn()
  createdAt: Date;

  @Index()
  @UpdateDateColumn()
  updatedAt: Date;
}
