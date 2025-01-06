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
import { Referee } from 'src/hr-payroll/entities/employees/referees.entity';
import { CreateRefereeDto } from 'src/hr-payroll/dto/employees/referees/create-referee.dto';
import { UpdateRefereeDto } from 'src/hr-payroll/dto/employees/referees/update-referee.dto';

@Injectable()
export class RefereesService {
  constructor(
    @InjectRepository(Referee)
    private refereesRepository: Repository<Referee>,

    @InjectRepository(Employee)
    private readonly employeesRepository: Repository<Employee>,
  ) { }

  // **********************************************************************************************************************************************
  async create(createRefereeDto: CreateRefereeDto, user: User): Promise<{ message: string }> {
    const { name, address, mobile, title, email, organisation, employeeId } = createRefereeDto;

    // Check if the employee exists
    const checkEmployee = await this.employeesRepository
      .createQueryBuilder('employee')
      .select('employee')
      .where('employee.id = :id', { id: employeeId })
      .getOne();

    if (!checkEmployee) {
      throw new BadRequestException(`Employee with ID: ${employeeId} not found`);
    }

    // Create a new Referee entity
    const referee = new Referee();
    referee.name = name;
    referee.address = address;
    referee.mobile = mobile;
    referee.title = title;
    referee.email = email;
    referee.organisation = organisation;
    referee.employeeId = employeeId;
    referee.createdBy = user;
    referee.updatedBy = user;

    // Save the new referee entity
    await this.refereesRepository.save(referee);

    return { message: 'Referee created successfully' };
  }

  // **********************************************************************************************************************************************
  async findOne(id: string): Promise<Referee> {
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
      throw new NotFoundException(`Referee with ID ${id} not found`);
    }

    return referee;
  }

  // **********************************************************************************************************************************************
  async update(
    id: string,
    updateRefereeDto: UpdateRefereeDto,
    user: User,
  ): Promise<{ message: string }> {
    const { name, address, mobile, title, email, organisation } =
      updateRefereeDto;
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
      throw new NotFoundException(`Referee with ID ${id} not found`);
    }

    // Update other fields, defaulting to existing values if not provided
    referee.name = name || referee.name;
    referee.address = address || referee.address;
    referee.mobile = mobile || referee.mobile;
    referee.title = title || referee.title;
    referee.email = email || referee.email;
    referee.organisation = organisation || referee.organisation;
    referee.updatedBy = user;

    await this.refereesRepository.save(referee);
    return { message: 'Referee updated successfully' };
  }
}
