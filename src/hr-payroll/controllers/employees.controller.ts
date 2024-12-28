import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { EmployeeService } from '../services/employees.service';
import { CreateEmployeeDto } from '../dto/employees/create-employee.dto';
import { UpdateEmployeeDto } from '../dto/employees/update-employee.dto';

@Controller('hr-payroll')
export class EmployeeController {
  constructor(private readonly hrPayrollService: EmployeeService) {}

  @Post()
  create(@Body() createEmployeeDto: CreateEmployeeDto) {
    return this.hrPayrollService.create(createEmployeeDto);
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
  update(@Param('id') id: string, @Body() updateEmployeeDto: UpdateEmployeeDto) {
    return this.hrPayrollService.update(+id, updateEmployeeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.hrPayrollService.remove(+id);
  }
}
