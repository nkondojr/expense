import { Injectable } from '@nestjs/common';
import { CreateEmployeeDto } from '../dto/employees/create-employee.dto';
import { UpdateEmployeeDto } from '../dto/employees/update-employee.dto';

@Injectable()
export class EmployeeService {
  create(createEmployeeDto: CreateEmployeeDto) {
    return 'This action adds a new hrPayroll';
  }

  findAll() {
    return `This action returns all hrPayroll`;
  }

  findOne(id: number) {
    return `This action returns a #${id} hrPayroll`;
  }

  update(id: number, updateEmployeeDto: UpdateEmployeeDto) {
    return `This action updates a #${id} hrPayroll`;
  }

  remove(id: number) {
    return `This action removes a #${id} hrPayroll`;
  }
}
