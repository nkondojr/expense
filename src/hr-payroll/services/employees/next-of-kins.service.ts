import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { isUUID } from 'class-validator';
import { Employee } from '../../entities/employees/employees.entity';
import { NextOfKin } from 'src/hr-payroll/entities/employees/next-of-kins.entity';
import { CreateNextOfKinDto } from 'src/hr-payroll/dto/employees/next-of-kins/create-next-of-kin.dto';
import { UpdateNextOfKinDto } from 'src/hr-payroll/dto/employees/next-of-kins/update-next-of-kin.dto';

@Injectable()
export class NextOfKinsService {
  constructor(
    @InjectRepository(NextOfKin)
    private refereesRepository: Repository<NextOfKin>,

    @InjectRepository(Employee)
    private readonly employeesRepository: Repository<Employee>,
  ) { }

  // **********************************************************************************************************************************************
  async create(createNextOfKinDto: CreateNextOfKinDto, user: User): Promise<{ message: string }> {
    const { name, address, mobile, relationShip, employeeId } = createNextOfKinDto;

    // Check if the employee exists
    const checkEmployee = await this.employeesRepository
      .createQueryBuilder('employee')
      .select('employee')
      .where('employee.id = :id', { id: employeeId })
      .getOne();

    if (!checkEmployee) {
      throw new BadRequestException(`Employee with ID: ${employeeId} not found`);
    }

    // Create a new NextOfKin entity
    const referee = new NextOfKin();
    referee.name = name;
    referee.address = address;
    referee.mobile = mobile;
    referee.relationShip = relationShip;
    referee.employeeId = employeeId;
    referee.createdBy = user;
    referee.updatedBy = user;

    // Save the new referee entity
    await this.refereesRepository.save(referee);

    return { message: 'Next of kin created successfully' };
  }

  // **********************************************************************************************************************************************
  async findOne(id: string): Promise<NextOfKin> {
    // Validate UUID format for ID
    if (!isUUID(id)) {
      throw new BadRequestException('Invalid UUID format');
    }

    // Attempt to find the referee by UUID
    const referee = await this.refereesRepository.findOne({
      where: { id },
      relations: ['employee'],
    });

    // Throw an error if the referee is not found
    if (!referee) {
      throw new NotFoundException(`Next of kin with ID ${id} not found`);
    }

    return referee;
  }

  // **********************************************************************************************************************************************
  async update(
    id: string,
    updateNextOfKinDto: UpdateNextOfKinDto,
    user: User,
  ): Promise<{ message: string }> {
    const { name, address, mobile, relationShip } =
      updateNextOfKinDto;
    // Validate UUID format for ID
    if (!isUUID(id)) {
      throw new BadRequestException('Invalid UUID format');
    }

    // Find the referee to update by UUID
    const referee = await this.refereesRepository.findOne({
      where: { id },
      relations: ['employee'],
    });
    if (!referee) {
      throw new NotFoundException(`Next of kin with ID ${id} not found`);
    }

    // Update other fields, defaulting to existing values if not provided
    referee.name = name || referee.name;
    referee.address = address || referee.address;
    referee.mobile = mobile || referee.mobile;
    referee.relationShip = relationShip || referee.relationShip;
    referee.updatedBy = user;

    await this.refereesRepository.save(referee);
    return { message: 'Next of kin updated successfully' };
  }
}
