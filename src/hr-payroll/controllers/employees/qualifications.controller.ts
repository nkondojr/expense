import {
  Controller,
  Get,
  Param,
  Body,
  Patch,
  UseGuards,
  Post,
} from '@nestjs/common';
import { GetUser } from 'src/authentication/decorators/get-user.decorator';
import { User } from 'src/users/entities/user.entity';
import { JwtAuthGuard } from 'src/authentication/guards/jwt-auth.guard';
import { QualificationsService } from 'src/hr-payroll/services/employees/qualifications.service';
import { CreateQualificationDto } from 'src/hr-payroll/dto/employees/qualifications/create-qualification.dto';
import { Qualification } from 'src/hr-payroll/entities/employees/qualifications.entity';
import { UpdateQualificationDto } from 'src/hr-payroll/dto/employees/qualifications/update-qualification.dto';

@Controller('hr-payroll/employees/qualifications')
@UseGuards(JwtAuthGuard)
export class QualificationsController {
  constructor(private readonly allocationsService: QualificationsService) { }

  @Post()
  async createAmcosQualification(
    @Body() createQualificationDto: CreateQualificationDto,
    @GetUser() user: User,
  ): Promise<{ message: string }> {
    return this.allocationsService.create(createQualificationDto, user);
  }

  @Get(':id')
  async getQualification(@Param('id') id: string): Promise<Qualification> {
    return this.allocationsService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateQualificationDto: UpdateQualificationDto,
    @GetUser() user: User,
  ): Promise<{ message: string }> {
    return this.allocationsService.update(id, updateQualificationDto, user);
  }
}
