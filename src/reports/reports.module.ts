import { Module } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Report } from './entities/report.entity';
import { Expense } from 'src/expense/entities/expense.entity';
import { Organization } from 'src/organizations/entities/organization.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Report, Expense, Organization])],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
