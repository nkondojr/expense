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
import { RefereesService } from 'src/hr-payroll/services/employees/referees.service';
import { CreateRefereeDto } from 'src/hr-payroll/dto/employees/referees/create-referee.dto';
import { Referee } from 'src/hr-payroll/entities/employees/referees.entity';
import { UpdateRefereeDto } from 'src/hr-payroll/dto/employees/referees/update-referee.dto';

@Controller('hr-payroll/employees/referees')
@UseGuards(JwtAuthGuard)
export class RefereesController {
  constructor(private readonly allocationsService: RefereesService) { }

  @Post()
  async createAmcosReferee(
    @Body() createRefereeDto: CreateRefereeDto,
    @GetUser() user: User,
  ): Promise<{ message: string }> {
    return this.allocationsService.create(createRefereeDto, user);
  }

  @Get(':id')
  async getReferee(@Param('id') id: string): Promise<Referee> {
    return this.allocationsService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateRefereeDto: UpdateRefereeDto,
    @GetUser() user: User,
  ): Promise<{ message: string }> {
    return this.allocationsService.update(id, updateRefereeDto, user);
  }
}
