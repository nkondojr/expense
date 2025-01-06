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
import { AllocationsService } from 'src/hr-payroll/services/employees/allocations.service';
import { CreateAllocationDto } from 'src/hr-payroll/dto/employees/allocations/create-allcocation.dto';
import { Allocation } from 'src/hr-payroll/entities/employees/allocations.entity';
import { UpdateAllocationDto } from 'src/hr-payroll/dto/employees/allocations/update-allocation.dto';

@Controller('hr-payroll/employees/allocations')
@UseGuards(JwtAuthGuard)
export class AllocationsController {
  constructor(private readonly allocationsService: AllocationsService) { }

  @Post()
  async createAmcosAllocation(
    @Body() createAllocationDto: CreateAllocationDto,
    @GetUser() user: User,
  ): Promise<{ message: string }> {
    return this.allocationsService.create(createAllocationDto, user);
  }

  @Get(':id')
  async getAllocation(@Param('id') id: string): Promise<Allocation> {
    return this.allocationsService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateAllocationDto: UpdateAllocationDto,
    @GetUser() user: User,
  ): Promise<{ message: string }> {
    return this.allocationsService.update(id, updateAllocationDto, user);
  }

  @Patch(':id/activate')
  async toggleAllocationStatus(
    @Param('id') id: string,
  ): Promise<{ message: string }> {
    return this.allocationsService.toggleAllocationStatus(id);
  }
}
