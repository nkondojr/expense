import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { buildPaginationResponse, paginate } from 'utils/pagination.utils';
import { Not, Raw, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { isUUID } from 'class-validator';
import { SearchParams } from 'utils/search-parms.util';
import { Employee } from '../entities/employees/employees.entity';
import { Contract } from '../entities/employees/contracts.entity';
import { Allocation } from '../entities/employees/allocations.entity';
import { User } from 'src/users/entities/user.entity';
import { Qualification } from '../entities/employees/qualifications.entity';
import { CreateEmployeeDto } from '../dto/employees/create-employee.dto';
import { FileType, saveImage } from 'utils/image-media.utils';
import { UpdateEmployeeDto } from '../dto/employees/update-employee.dto';

@Injectable()
export class EmployeesService {
  constructor(
    @InjectRepository(Employee)
    private employeesRepository: Repository<Employee>,

    @InjectRepository(Contract)
    private contractsRepository: Repository<Contract>,

    @InjectRepository(Allocation)
    private allocationsRepository: Repository<Allocation>,

    @InjectRepository(Qualification)
    private qualificationsRepository: Repository<Qualification>,

    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) { }

  // ***********************************************************************************************************************************************
  async create(createEmployeeDto: CreateEmployeeDto): Promise<{ message: string }> {
    let {
      title,
      placeOfBirth,
      regNumber,
      employmentNumber,
      tin,
      attachment,
      maritalStatus,
      userId,
      region,
      district,
      pensionNumber,
      ward,
      street,
      dob,
      idType,
      idNumber,
      employmentType,
      employmentDate,
      contracts,
      allocations,
      qualifications,
    } = createEmployeeDto;

    // Trim all string fields
    idNumber = idNumber?.trim();
    placeOfBirth = placeOfBirth?.trim();
    regNumber = regNumber?.trim();
    employmentNumber = employmentNumber?.trim();
    attachment = attachment?.trim();
    region = region?.trim();
    district = district?.trim();
    ward = ward?.trim();
    street = street?.trim();

    // Check for duplicate Employee by userId
    const existingUserEmployee = await this.employeesRepository.findOne({
      where: { userId },
    });
    if (existingUserEmployee) {
      throw new ConflictException(`Employee with userId ${userId} already exists.`);
    }

    // Validate user existence
    const user = await this.usersRepository.findOne({
      where: { id: userId }, // Ensure userId is cast to string
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Validate that user is active
    if (!user.is_active) {
      throw new NotFoundException(
        `User with ID ${userId} is not active`,
      );
    }

    // Convert tin to string for manipulation
    let tinString = tin?.toString().trim();

    // Ensure tin contains only digits
    if (tinString && !/^\d+$/.test(tinString)) {
      throw new BadRequestException('Tin number must contain only digits.');
    }


    if (tinString.length !== 9) {
      throw new BadRequestException('Tin number must be exactly 9 digits long.');
    }

    // Validate mandatory fields
    if (!title || !regNumber || !tinString || !region || !district || !ward || !street) {
      throw new BadRequestException('Mandatory fields are missing.');
    }

    // Check for duplicate Employee by employment number
    const existingEmail = await this.employeesRepository.findOne({
      where: { employmentNumber: Raw(alias => `LOWER(TRIM(${alias})) = LOWER(TRIM(:employmentNumber))`, { employmentNumber }) },
    });
    if (existingEmail) {
      throw new ConflictException(`Employee with employment number ${employmentNumber} already exists.`);
    }

    // Check for duplicate Employee by tin
    const existingTin = await this.employeesRepository.findOne({
      where: { tin: Number(tinString) },
    });
    if (existingTin) {
      throw new ConflictException(`Employee with tin ${tinString} already exists.`);
    }

    // Handle the attachment image
    const imageUrl = attachment ? saveImage(attachment, FileType.ATTACHMENT) : null;

    // Create Employee entity
    const employee = new Employee();
    employee.title = title;
    employee.placeOfBirth = placeOfBirth || null;
    employee.regNumber = regNumber;
    employee.employmentNumber = employmentNumber;
    employee.maritalStatus = maritalStatus;
    employee.attachment = imageUrl;
    employee.tin = Number(tinString);
    employee.userId = userId;
    employee.region = region;
    employee.district = district;
    employee.pensionNumber = pensionNumber;
    employee.idNumber = idNumber;
    employee.ward = ward;
    employee.street = street;
    employee.dob = dob;
    employee.idType = idType;
    employee.employmentType = employmentType;
    employee.employmentDate = employmentDate;

    try {
      // Save Employee
      const savedEmployee = await this.employeesRepository.save(employee);

      // Map employeeId to contracts and save them if provided
      if (contracts && contracts.length > 0) {
        for (const contract of contracts) {
          const contractEntity = new Contract();
          contractEntity.appointmentDate = contract.appointmentDate;
          contractEntity.contractEndDate = contract.contractEndDate;
          contractEntity.retirementDate = contract.retirementDate;
          contractEntity.attachment = contract.attachment ? saveImage(contract.attachment, FileType.ATTACHMENT) : null;
          contractEntity.employee = savedEmployee;
          await this.contractsRepository.save(contractEntity);
        }
      }

      // Map employeeId to allocations and save them if provided
      if (allocations && allocations.length > 0) {
        for (const allocation of allocations) {
          const allocationEntity = new Allocation();
          allocationEntity.department = allocation.department.trim();
          allocationEntity.jobTitle = allocation.jobTitle.trim();
          allocationEntity.basicSalary = allocation.basicSalary.trim();
          allocationEntity.employee = savedEmployee;
          await this.allocationsRepository.save(allocationEntity);
        }
      }

      // Map employeeId to qualifications and save them if provided
      if (qualifications && qualifications.length > 0) {
        for (const qualification of qualifications) {
          const qualificationEntity = new Qualification();
          qualificationEntity.type = qualification.type;
          qualificationEntity.educationLevel = qualification.educationLevel.trim();
          qualificationEntity.institutionName = qualification.institutionName.trim();
          qualificationEntity.country = qualification.country.trim();
          qualificationEntity.programName = qualification.programName.trim();
          qualificationEntity.startDate = qualification.startDate;
          qualificationEntity.endDate = qualification.endDate;
          qualificationEntity.dateAwarded = qualification.dateAwarded;
          qualificationEntity.attachment = qualification.attachment ? saveImage(qualification.attachment, FileType.ATTACHMENT) : null;
          qualificationEntity.gradeType = qualification.gradeType;
          qualificationEntity.grade = qualification.grade.trim();
          qualificationEntity.gradePoints = qualification.gradePoints.trim();
          qualificationEntity.employee = savedEmployee;
          await this.qualificationsRepository.save(qualificationEntity);
        }
      }

      return {
        message: 'Employee created successfully',
      };
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException('Employee already exists.');
      }
      throw error;
    }
  }

  // ***********************************************************************************************************************************************
  async findAll(searchParams: SearchParams): Promise<any> {
    const { searchTerm, page, pageSize } = searchParams;

    const query = this.employeesRepository
      .createQueryBuilder('employees')
      .leftJoinAndSelect('employees.user', 'user')
      .select(['employees', 'user']);

    if (searchTerm) {
      const searchTerms = searchTerm.trim().split(/\s+/); // Split search term into words

      query.where(
        `
        COALESCE(employees.title, '') || ' ' || COALESCE(user."fullName", '') ILIKE :fullNames
        OR employees."regNumber" ILIKE :searchTerm
        OR employees.region ILIKE :searchTerm
        OR employees.district ILIKE :searchTerm
        OR employees.ward ILIKE :searchTerm
        OR employees.street ILIKE :searchTerm
        OR employees."maritalStatus" ILIKE :searchTerm
        OR CAST(employees.tin AS TEXT) ILIKE :searchTerm
        OR employees."regNumber" ILIKE :searchTerm
        OR employees."employmentType" ILIKE :searchTerm
        OR user."fullName" ILIKE :searchTerm
        OR user.mobile ILIKE :searchTerm
        OR user.gender ILIKE :searchTerm
        OR user.email ILIKE :searchTerm
        `,
        {
          fullNames: `%${searchTerms.join(' ')}%`,
          searchTerm: `%${searchTerm}%`,
        },
      )
        .orWhere("TO_CHAR(employees.dob, 'DD-MM-YYYY') ILIKE :searchTerm", {
          searchTerm: `%${searchTerm}%`,
        })
        .orWhere("TO_CHAR(employees.employmentDate, 'DD-MM-YYYY') ILIKE :searchTerm", {
          searchTerm: `%${searchTerm}%`,
        });
    }

    // Apply pagination
    paginate(query, page, pageSize);

    // Execute query and get results with count
    const [employees, total] = await query.getManyAndCount();

    // Build the pagination response
    return buildPaginationResponse(employees, total, page, pageSize, '/hr-payroll/employees');
  }

  // ***********************************************************************************************************************************************
  async findOne(id: string): Promise<any> {
    // Validate the ID format
    if (!isUUID(id)) {
      throw new BadRequestException('Invalid ID format');
    }

    const employee = await this.employeesRepository.findOne({
      where: { id },
      relations: ['user', 'banks', 'contracts', 'allocations', 'qualifications', 'referees', 'nextOfKins', 'workHistories'],
    });
    if (!employee) {
      throw new NotFoundException(`Employee with ID ${id} not found`);
    }

    return employee;
  }

  // ***********************************************************************************************************************************************
  async update(
    id: string,
    updateEmployeeDto: UpdateEmployeeDto,
  ): Promise<{ message: string }> {
    let {
      title,
      placeOfBirth,
      regNumber,
      employmentNumber,
      tin,
      attachment,
      maritalStatus,
      region,
      district,
      pensionNumber,
      ward,
      street,
      dob,
      idType,
      idNumber,
      employmentType,
      employmentDate,
    } = updateEmployeeDto;

    // Validate the ID format
    if (!isUUID(id)) {
      throw new BadRequestException('Invalid ID format');
    }

    // Retrieve the employee by UUID
    const employee = await this.employeesRepository.findOne({ where: { id } });
    if (!employee) {
      throw new NotFoundException(`Employee with ID ${id} not found`);
    }

    // Normalize and validate input fields
    idNumber = idNumber?.trim();
    placeOfBirth = placeOfBirth?.trim();
    regNumber = regNumber?.trim();
    employmentNumber = employmentNumber?.trim();
    attachment = attachment?.trim();
    region = region?.trim();
    district = district?.trim();
    ward = ward?.trim();
    street = street?.trim();
    pensionNumber = pensionNumber?.trim();

    // Handle tin as a string for processing
    let tinString = tin ? tin.toString().trim() : undefined;

    if (tinString) {
      // Ensure tin contains only digits
      if (!/^\d+$/.test(tinString)) {
        throw new BadRequestException('Tin number must contain only digits.');
      }

      // Add prefix '255' if missing
      if (!tinString.startsWith('255')) {
        tinString = `255${tinString}`;
      }
    }

    // Validate that the tin number (excluding the prefix) is 9 digits long
    const rawTin = tinString.startsWith('255')
      ? tinString.substring(3)
      : tinString;

    if (rawTin.length !== 9) {
      throw new BadRequestException('Tin number must be exactly 9 digits long.');
    }

    // Check for duplicate employmentNumber (case-insensitive and trimmed)
    if (employmentNumber && employmentNumber !== employee.employmentNumber) {
      const existingEmployeeEmail = await this.employeesRepository.findOne({
        where: {
          employmentNumber: Raw((alias) => `LOWER(TRIM(${alias})) = LOWER(TRIM(:employmentNumber))`, {
            employmentNumber,
          }),
          id: Not(id), // Exclude the current employee by UUID
        },
      });
      if (existingEmployeeEmail) {
        throw new ConflictException(
          `Employee with employmentNumber ${employmentNumber} already exists.`,
        );
      }
    }

    // Check for duplicate tin (numeric comparison)
    if (tinString && Number(tinString) !== employee.tin) {
      const existingTin = await this.employeesRepository.findOne({
        where: { tin: Number(tinString), id: Not(id) }, // Exclude the current employee by UUID
      });
      if (existingTin) {
        throw new ConflictException(
          `Employee with tin ${tinString} already exists.`,
        );
      }
    }

    // Update employee fields conditionally
    if (title) employee.title = title;
    if (placeOfBirth) employee.placeOfBirth = placeOfBirth;
    if (regNumber) employee.regNumber = regNumber;
    if (employmentNumber) employee.employmentNumber = employmentNumber;
    if (tinString) employee.tin = Number(tinString); // Convert back to number for storage
    if (region) employee.region = region;
    if (district) employee.district = district;
    if (ward) employee.ward = ward;
    if (street) employee.street = street;
    if (maritalStatus) employee.maritalStatus = maritalStatus;
    if (attachment) employee.attachment = saveImage(attachment, FileType.ATTACHMENT);

    try {
      // Save the updated employee
      await this.employeesRepository.save(employee);
      return { message: 'Employee updated successfully' };
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException('Email or tin already in use');
      } else {
        throw error;
      }
    }
  }

  // ***********************************************************************************************************************************************
  async toggleEmployeeStatus(id: string): Promise<{ message: string }> {
    // Validate the UUID format
    if (!isUUID(id)) {
      throw new BadRequestException('Invalid UUID format');
    }

    const employee = await this.employeesRepository.findOne({ where: { id } });
    if (!employee) {
      throw new NotFoundException(`Employee with ID ${id} not found`);
    }

    // Toggle the isActive status
    employee.isActive = !employee.isActive;
    await this.employeesRepository.save(employee);

    const state = employee.isActive ? 'activated' : 'deactivated';
    return { message: `Employee ${state} successfully` };
  }
}
