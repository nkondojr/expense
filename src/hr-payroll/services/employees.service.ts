import { Injectable } from '@nestjs/common';
import { CreateHrPayrollDto } from '../dto/create-employee.dto';
import { UpdateHrPayrollDto } from '../dto/update-employee.dto';

@Injectable()
export class HrPayrollService {
  create(createHrPayrollDto: CreateHrPayrollDto) {
    return 'This action adds a new hrPayroll';
  }

  findAll() {
    return `This action returns all hrPayroll`;
  }

  findOne(id: number) {
    return `This action returns a #${id} hrPayroll`;
  }

  update(id: number, updateHrPayrollDto: UpdateHrPayrollDto) {
    return `This action updates a #${id} hrPayroll`;
  }

  remove(id: number) {
    return `This action removes a #${id} hrPayroll`;
  }
}
