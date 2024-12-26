import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrganizationService } from './organizations.service'; // Fixed import
import { OrganizationController } from './organizations.controller';
import { Organization } from './entities/organization.entity';
import { AuthenticationModule } from 'src/authentication/authentication.module';
import { FinancialYear } from './entities/financial-years/financial-year.entity';
import { FinancialYearService } from 'src/seeders/financial-year.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Organization, FinancialYear]),
    forwardRef(() => AuthenticationModule), // Import AuthenticationModule
  ],
  providers: [OrganizationService, FinancialYearService],
  controllers: [OrganizationController],
})
export class OrganizationModule {}
