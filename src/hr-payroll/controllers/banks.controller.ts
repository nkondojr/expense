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
import { CreateEmployeeBankDto } from '../dto/employees/banks/create-bank.dto';
import { EmployeeBank } from '../entities/employees/banks.entity';
import { UpdateEmployeeBankDto } from '../dto/employees/banks/update-bank.dto';
import { EmployeeBanksService } from '../services/banks.service';

@Controller('hr-payroll/employees/banks')
@UseGuards(JwtAuthGuard)
export class EmployeeBanksController {
  constructor(private readonly banksService: EmployeeBanksService) { }

  @Post()
  async createAmcosBank(
    @Body() createEmployeeBankDto: CreateEmployeeBankDto,
    @GetUser() user: User,
  ): Promise<{ message: string }> {
    return this.banksService.create(createEmployeeBankDto, user);
  }

  @Get(':id')
  async getBank(@Param('id') id: string): Promise<EmployeeBank> {
    return this.banksService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateEmployeeBankDto: UpdateEmployeeBankDto,
    @GetUser() user: User,
  ): Promise<{ message: string }> {
    return this.banksService.update(id, updateEmployeeBankDto, user);
  }

  @Patch(':id/activate-deactivate')
  async toggleBankStatus(
    @Param('id') id: string,
  ): Promise<{ message: string }> {
    return this.banksService.toggleBankStatus(id);
  }
}
