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
import { WorkHistory } from 'src/hr-payroll/entities/employees/work-histories.entity';
import { CreateWorkHistoryDto } from 'src/hr-payroll/dto/employees/work-histories/create-work-history.dto';
import { UpdateWorkHistoryDto } from 'src/hr-payroll/dto/employees/work-histories/update-work-history.dto';

@Injectable()
export class WorkHistoryService {
  constructor(
    @InjectRepository(WorkHistory)
    private refereesRepository: Repository<WorkHistory>,

    @InjectRepository(Employee)
    private readonly employeesRepository: Repository<Employee>,
  ) { }

  // **********************************************************************************************************************************************
  async create(createWorkHistoryDto: CreateWorkHistoryDto, user: User): Promise<{ message: string }> {
    const { company, telephone, address, startDate, jobTitle, email, endDate, employeeId } = createWorkHistoryDto;

    // Check if the employee exists
    const checkEmployee = await this.employeesRepository
      .createQueryBuilder('employee')
      .select('employee')
      .where('employee.id = :id', { id: employeeId })
      .getOne();

    if (!checkEmployee) {
      throw new BadRequestException(`Employee with ID: ${employeeId} not found`);
    }

    // Create a new WorkHistory entity
    const referee = new WorkHistory();
    referee.company = company;
    referee.telephone = telephone;
    referee.address = address;
    referee.startDate = startDate;
    referee.jobTitle = jobTitle;
    referee.email = email;
    referee.endDate = endDate;
    referee.employeeId = employeeId;
    referee.createdBy = user;
    referee.updatedBy = user;

    // Save the new referee entity
    await this.refereesRepository.save(referee);

    return { message: 'Work history created successfully' };
  }

  // **********************************************************************************************************************************************
  async findOne(id: string): Promise<WorkHistory> {
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
      throw new NotFoundException(`Work history with ID ${id} not found`);
    }

    return referee;
  }

  // **********************************************************************************************************************************************
  async update(
    id: string,
    updateWorkHistoryDto: UpdateWorkHistoryDto,
    user: User,
  ): Promise<{ message: string }> {
    const { company, telephone, address, startDate, jobTitle, email, endDate } =
      updateWorkHistoryDto;
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
      throw new NotFoundException(`WorkHistory with ID ${id} not found`);
    }

    // Update other fields, defaulting to existing values if not provided
    referee.company = company || referee.company;
    referee.telephone = telephone || referee.telephone;
    referee.address = address || referee.address;
    referee.startDate = startDate || referee.startDate;
    referee.jobTitle = jobTitle || referee.jobTitle;
    referee.email = email || referee.email;
    referee.endDate = endDate || referee.endDate;
    referee.updatedBy = user;

    await this.refereesRepository.save(referee);
    return { message: 'Work history updated successfully' };
  }
}
