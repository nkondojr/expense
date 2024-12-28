import { Controller, Post, Body, Param, Patch, UseGuards } from '@nestjs/common';
import { StaffService } from '../service/staffs.service';
import { CreateStaffDto } from '../dto/staffs/create-staff.dto';
import { UpdateStaffDto } from '../dto/staffs/update-staff.dto';
import { JwtAuthGuard } from 'src/authentication/guards/jwt-auth.guard';

@Controller('staffs')
@UseGuards(JwtAuthGuard)
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  // ***********************************************************************************************************************************************
  @Post()
  async create(@Body() createStaffDto: CreateStaffDto) {
    const result = await this.staffService.create(createStaffDto);
    return result;
  }

  // ***********************************************************************************************************************************************
  @Patch(':uuid')
  async update(
    @Param('uuid') uuid: string,
    @Body() updateStaffDto: UpdateStaffDto,
  ) {
    const result = await this.staffService.update(uuid, updateStaffDto);
    return result;
  }
}
