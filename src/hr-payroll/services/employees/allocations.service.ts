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
import { Allocation } from 'src/hr-payroll/entities/employees/allocations.entity';
import { CreateAllocationDto } from 'src/hr-payroll/dto/employees/allocations/create-allcocation.dto';
import { UpdateAllocationDto } from 'src/hr-payroll/dto/employees/allocations/update-allocation.dto';

@Injectable()
export class AllocationsService {
  constructor(
    @InjectRepository(Allocation)
    private allocationsRepository: Repository<Allocation>,

    @InjectRepository(Employee)
    private readonly employeesRepository: Repository<Employee>,
  ) { }

  // **********************************************************************************************************************************************
  async create(createAllocationDto: CreateAllocationDto, user: User): Promise<{ message: string }> {
    const { department, jobTitle, basicSalary, employeeId } = createAllocationDto;

    // Check if the employee exists
    const checkEmployee = await this.employeesRepository
      .createQueryBuilder('employee')
      .select('employee')
      .where('employee.id = :id', { id: employeeId })
      .getOne();

    if (!checkEmployee) {
      throw new BadRequestException(`Employee with ID: ${employeeId} not found`);
    }

    // Set isActive to false for all existing allocations of the same employeeId
    await this.allocationsRepository
      .createQueryBuilder()
      .update(Allocation)
      .set({ isActive: false })
      .where('employeeId = :employeeId', { employeeId })
      .execute();

    // Create a new Allocation entity
    const allocation = new Allocation();
    allocation.department = department;
    allocation.jobTitle = jobTitle;
    allocation.basicSalary = basicSalary;
    allocation.employeeId = employeeId;
    allocation.isActive = true; // Set the newly created allocation as active
    allocation.createdBy = user;
    allocation.updatedBy = user;

    // Save the new allocation entity
    await this.allocationsRepository.save(allocation);

    return { message: 'Allocation created successfully' };
  }

  // **********************************************************************************************************************************************
  async findOne(id: string): Promise<Allocation> {
    // Validate UUID format for ID
    if (!isUUID(id)) {
      throw new BadRequestException('Invalid UUID format');
    }

    // Attempt to find the allocation by UUID
    const allocation = await this.allocationsRepository.findOne({
      where: { id },
      relations: ['employee'],
    });

    // Throw an error if the allocation is not found
    if (!allocation) {
      throw new NotFoundException(`Allocation with ID ${id} not found`);
    }

    return allocation;
  }

  // **********************************************************************************************************************************************
  async update(
    id: string,
    updateAllocationDto: UpdateAllocationDto,
    user: User,
  ): Promise<{ message: string }> {
    const { department, jobTitle, basicSalary } =
      updateAllocationDto;
    // Validate UUID format for ID
    if (!isUUID(id)) {
      throw new BadRequestException('Invalid UUID format');
    }

    // Find the allocation to update by UUID
    const allocation = await this.allocationsRepository.findOne({
      where: { id },
      relations: ['employee'],
    });
    if (!allocation) {
      throw new NotFoundException(`Allocation with ID ${id} not found`);
    }

    // Update other fields, defaulting to existing values if not provided
    allocation.department = department || allocation.department;
    allocation.jobTitle = jobTitle || allocation.jobTitle;
    allocation.basicSalary = basicSalary || allocation.basicSalary;
    allocation.updatedBy = user;

    await this.allocationsRepository.save(allocation);
    return { message: 'Allocation updated successfully' };
  }

  // ***********************************************************************************************************************************************
  async toggleAllocationStatus(id: string): Promise<{ message: string }> {
    // Validate the ID format
    if (!isUUID(id)) {
      throw new BadRequestException('Invalid UUID format');
    }

    // Find the allocation by ID
    const allocation = await this.allocationsRepository.findOne({
      where: { id },
    });

    if (!allocation) {
      throw new NotFoundException(`Allocation with ID ${id} not found`);
    }

    // Ensure only one allocation is active for the employee
    if (!allocation.isActive) {
      // Deactivate all other allocations for the same employeeId
      await this.allocationsRepository
        .createQueryBuilder()
        .update(Allocation)
        .set({ isActive: false })
        .where('employeeId = :employeeId', { employeeId: allocation.employeeId })
        .execute();

      // Activate the current allocation
      allocation.isActive = true;
    }

    // Save the allocation with the updated status
    await this.allocationsRepository.save(allocation);

    return { message: `Allocation activated successfully` };
  }
}
