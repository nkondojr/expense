import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrganizationService } from './organizations.service'; // Fixed import
import { OrganizationController } from './organizations.controller';
import { Organization } from './entities/organization.entity';
import { AuthenticationModule } from 'src/authentication/authentication.module';
import { FinancialYear } from './entities/financial-years/financial-year.entity';
import { FinancialYearService } from 'src/seeders/financial-year.service';
import { BanksController } from './banks/banks.controller';
import { BanksService } from './banks/banks.service';
import { Bank } from './entities/banks/bank.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Organization, FinancialYear, Bank]),
    forwardRef(() => AuthenticationModule), // Import AuthenticationModule
  ],
  providers: [OrganizationService, FinancialYearService, BanksService],
  controllers: [OrganizationController, BanksController],
})
export class OrganizationModule {}
