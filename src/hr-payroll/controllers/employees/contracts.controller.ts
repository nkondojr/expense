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
import { ContractsService } from 'src/hr-payroll/services/employees/contracts.service';
import { CreateContractDto } from 'src/hr-payroll/dto/employees/contracts/create-contract.dto';
import { Contract } from 'src/hr-payroll/entities/employees/contracts.entity';
import { UpdateContractDto } from 'src/hr-payroll/dto/employees/contracts/update-contract.dto';

@Controller('hr-payroll/employees/contracts')
@UseGuards(JwtAuthGuard)
export class ContractsController {
  constructor(private readonly allocationsService: ContractsService) { }

  @Post()
  async createAmcosContract(
    @Body() createContractDto: CreateContractDto,
    @GetUser() user: User,
  ): Promise<{ message: string }> {
    return this.allocationsService.create(createContractDto, user);
  }

  @Get(':id')
  async getContract(@Param('id') id: string): Promise<Contract> {
    return this.allocationsService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateContractDto: UpdateContractDto,
    @GetUser() user: User,
  ): Promise<{ message: string }> {
    return this.allocationsService.update(id, updateContractDto, user);
  }
}
