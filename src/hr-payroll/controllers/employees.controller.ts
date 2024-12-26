import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { HrPayrollService } from '../services/employees.service';
import { CreateHrPayrollDto } from '../dto/create-employee.dto';
import { UpdateHrPayrollDto } from '../dto/update-employee.dto';

@Controller('hr-payroll')
export class HrPayrollController {
  constructor(private readonly hrPayrollService: HrPayrollService) {}

  @Post()
  create(@Body() createHrPayrollDto: CreateHrPayrollDto) {
    return this.hrPayrollService.create(createHrPayrollDto);
  }

  @Get()
  findAll() {
    return this.hrPayrollService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.hrPayrollService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateHrPayrollDto: UpdateHrPayrollDto) {
    return this.hrPayrollService.update(+id, updateHrPayrollDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.hrPayrollService.remove(+id);
  }
}
