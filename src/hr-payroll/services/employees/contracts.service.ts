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
import { Contract } from 'src/hr-payroll/entities/employees/contracts.entity';
import { CreateContractDto } from 'src/hr-payroll/dto/employees/contracts/create-contract.dto';
import { UpdateContractDto } from 'src/hr-payroll/dto/employees/contracts/update-contract.dto';
import { FileType, saveImage } from 'utils/image-media.utils';

@Injectable()
export class ContractsService {
  constructor(
    @InjectRepository(Contract)
    private contractsRepository: Repository<Contract>,

    @InjectRepository(Employee)
    private readonly employeesRepository: Repository<Employee>,
  ) { }

  // **********************************************************************************************************************************************
  async create(createContractDto: CreateContractDto, user: User): Promise<{ message: string }> {
    const { appointmentDate, contractEndDate, attachment, employeeId } = createContractDto;

    // Check if the employee exists
    const checkEmployee = await this.employeesRepository
      .createQueryBuilder('employee')
      .select('employee')
      .where('employee.id = :id', { id: employeeId })
      .getOne();

    if (!checkEmployee) {
      throw new BadRequestException(`Employee with ID: ${employeeId} not found`);
    }

    // Set isActive to false for all existing contracts of the same employeeId
    await this.contractsRepository
      .createQueryBuilder()
      .update(Contract)
      .set({ isActive: false })
      .where('employeeId = :employeeId', { employeeId })
      .execute();

    // Handle the attachment image
    const imageUrl = attachment ? saveImage(attachment, FileType.ATTACHMENT) : null;

    // Create a new Contract entity
    const contract = new Contract();
    contract.appointmentDate = appointmentDate;
    contract.contractEndDate = contractEndDate;
    contract.attachment = imageUrl;
    contract.employeeId = employeeId;
    contract.isActive = true; // Set the newly created contract as active
    contract.createdBy = user;
    contract.updatedBy = user;

    // Save the new contract entity
    await this.contractsRepository.save(contract);

    return { message: 'Contract created successfully' };
  }

  // **********************************************************************************************************************************************
  async findOne(id: string): Promise<Contract> {
    // Validate UUID format for ID
    if (!isUUID(id)) {
      throw new BadRequestException('Invalid UUID format');
    }

    // Attempt to find the contract by UUID
    const contract = await this.contractsRepository.findOne({
      where: { id },
      relations: ['employee'],
    });

    // Throw an error if the contract is not found
    if (!contract) {
      throw new NotFoundException(`Contract with ID ${id} not found`);
    }

    return contract;
  }

  // **********************************************************************************************************************************************
  async update(
    id: string,
    updateContractDto: UpdateContractDto,
    user: User,
  ): Promise<{ message: string }> {
    const { appointmentDate, contractEndDate, attachment, retirementDate, endOfContractReason } =
      updateContractDto;
    // Validate UUID format for ID
    if (!isUUID(id)) {
      throw new BadRequestException('Invalid UUID format');
    }

    // Find the contract to update by UUID
    const contract = await this.contractsRepository.findOne({
      where: { id },
      relations: ['employee'],
    });
    if (!contract) {
      throw new NotFoundException(`Contract with ID ${id} not found`);
    }

    // Update other fields, defaulting to existing values if not provided
    contract.appointmentDate = appointmentDate || contract.appointmentDate;
    contract.contractEndDate = contractEndDate || contract.contractEndDate;
    contract.retirementDate = retirementDate || contract.retirementDate;
    contract.endOfContractReason = endOfContractReason || contract.endOfContractReason;
    contract.attachment = attachment || saveImage(attachment, FileType.ATTACHMENT);
    contract.updatedBy = user;

    await this.contractsRepository.save(contract);
    return { message: 'Contract updated successfully' };
  }
}
