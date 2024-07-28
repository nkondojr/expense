
import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrganizationService } from './organizations.service'; // Fixed import
import { OrganizationController } from './organizations.controller';
import { Organization } from './entities/organization.entity';
import { AuthenticationModule } from 'src/authentication/authentication.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Organization]),
    forwardRef(() => AuthenticationModule), // Import AuthenticationModule
],
  providers: [OrganizationService],
  controllers: [OrganizationController],
})
export class OrganizationModule {}
