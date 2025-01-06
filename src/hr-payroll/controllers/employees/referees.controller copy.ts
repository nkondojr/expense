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
import { NextOfKinsService } from 'src/hr-payroll/services/employees/next-of-kins.service';
import { CreateNextOfKinDto } from 'src/hr-payroll/dto/employees/next-of-kins/create-next-of-kin.dto';
import { NextOfKin } from 'src/hr-payroll/entities/employees/next-of-kins.entity';
import { UpdateNextOfKinDto } from 'src/hr-payroll/dto/employees/next-of-kins/update-next-of-kin.dto';

@Controller('hr-payroll/employees/next-of-kins')
@UseGuards(JwtAuthGuard)
export class NextOfKinsController {
  constructor(private readonly allocationsService: NextOfKinsService) { }

  @Post()
  async createAmcosNextOfKin(
    @Body() createNextOfKinDto: CreateNextOfKinDto,
    @GetUser() user: User,
  ): Promise<{ message: string }> {
    return this.allocationsService.create(createNextOfKinDto, user);
  }

  @Get(':id')
  async getNextOfKin(@Param('id') id: string): Promise<NextOfKin> {
    return this.allocationsService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateNextOfKinDto: UpdateNextOfKinDto,
    @GetUser() user: User,
  ): Promise<{ message: string }> {
    return this.allocationsService.update(id, updateNextOfKinDto, user);
  }
}
