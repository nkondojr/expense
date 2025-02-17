import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Body,
  UseGuards,
  Patch,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/authentication/guards/jwt-auth.guard';
import { CreateGeneralDeductionDto } from 'src/hr-payroll/dto/payroll/general/create-general.dto';
import { UpdateGeneralDeductionDto } from 'src/hr-payroll/dto/payroll/general/update-general.dto';
import { GeneralDeductionsService } from 'src/hr-payroll/services/payroll/general-deductions.service';

@Controller('hr-payroll/general-earning-deductions')
@UseGuards(JwtAuthGuard)
export class GeneralDeductionsController {
  constructor(private readonly generalDeductionsService: GeneralDeductionsService) { }

  @Post()
  async create(@Body() createGeneralDeductionDto: CreateGeneralDeductionDto) {
    return this.generalDeductionsService.create(createGeneralDeductionDto);
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.generalDeductionsService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateGeneralDeductionDto: UpdateGeneralDeductionDto
  ): Promise<{ message: string }> {
    return this.generalDeductionsService.update(id, updateGeneralDeductionDto);
  }

  @Patch(':id/activate-deactivate')
  async toggleGeneralStatus(
    @Param('id') id: string,
  ): Promise<{ message: string }> {
    return this.generalDeductionsService.toggleGeneralStatus(id);
  }
}
