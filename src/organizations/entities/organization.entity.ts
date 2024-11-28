import { Report } from 'src/reports/entities/report.entity';
import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';

@Entity()
export class Organization {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, nullable: false })
  name: string;

  @Column({ unique: true, nullable: false })
  reg_no: string;

  @Column({ unique: true, nullable: false })
  region: string;

  @Column({ unique: true, nullable: false })
  address: string;

  @Column({ unique: true, nullable: false })
  phone_no: string;

  @Column({ unique: true, nullable: false })
  tin_no: string;

  @Column({ unique: true, nullable: true })
  website?: string;

  @OneToMany(() => Report, (reports) => reports.organization)
  reports: Report[];
}
