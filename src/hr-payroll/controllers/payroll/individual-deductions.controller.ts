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
import { CreateIndividualDeductionDto } from 'src/hr-payroll/dto/payroll/individual/create-individual.dto';
import { UpdateIndividualDeductionDto } from 'src/hr-payroll/dto/payroll/individual/update-individual.dto';
import { IndividualDeductionsService } from 'src/hr-payroll/services/payroll/individual-deductions.service';

@Controller('hr-payroll/individual-earning-deductions')
@UseGuards(JwtAuthGuard)
export class IndividualDeductionsController {
  constructor(private readonly individualDeductionsService: IndividualDeductionsService) { }

  @Post()
  async create(@Body() createIndividualDeductionDto: CreateIndividualDeductionDto) {
    return this.individualDeductionsService.create(createIndividualDeductionDto);
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.individualDeductionsService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateIndividualDeductionDto: UpdateIndividualDeductionDto
  ): Promise<{ message: string }> {
    return this.individualDeductionsService.update(id, updateIndividualDeductionDto);
  }

  @Patch(':id/activate-deactivate')
  async toggleIndividualStatus(
    @Param('id') id: string,
  ): Promise<{ message: string }> {
    return this.individualDeductionsService.toggleIndividualStatus(id);
  }
}
