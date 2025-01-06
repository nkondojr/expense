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
import { CreateWorkHistoryDto } from 'src/hr-payroll/dto/employees/work-histories/create-work-history.dto';
import { WorkHistoryService } from 'src/hr-payroll/services/employees/work-histories.service';
import { WorkHistory } from 'src/hr-payroll/entities/employees/work-histories.entity';
import { UpdateWorkHistoryDto } from 'src/hr-payroll/dto/employees/work-histories/update-work-history.dto';

@Controller('hr-payroll/employees/work-histories')
@UseGuards(JwtAuthGuard)
export class WorkHistoryController {
  constructor(private readonly allocationsService: WorkHistoryService) { }

  @Post()
  async createAmcosWorkHistory(
    @Body() createWorkHistoryDto: CreateWorkHistoryDto,
    @GetUser() user: User,
  ): Promise<{ message: string }> {
    return this.allocationsService.create(createWorkHistoryDto, user);
  }

  @Get(':id')
  async getWorkHistory(@Param('id') id: string): Promise<WorkHistory> {
    return this.allocationsService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateWorkHistoryDto: UpdateWorkHistoryDto,
    @GetUser() user: User,
  ): Promise<{ message: string }> {
    return this.allocationsService.update(id, updateWorkHistoryDto, user);
  }
}
