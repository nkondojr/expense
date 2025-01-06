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
import { FileType, saveImage } from 'utils/image-media.utils';
import { Qualification } from 'src/hr-payroll/entities/employees/qualifications.entity';
import { CreateQualificationDto } from 'src/hr-payroll/dto/employees/qualifications/create-qualification.dto';
import { UpdateQualificationDto } from 'src/hr-payroll/dto/employees/qualifications/update-qualification.dto';

@Injectable()
export class QualificationsService {
  constructor(
    @InjectRepository(Qualification)
    private qualificationsRepository: Repository<Qualification>,

    @InjectRepository(Employee)
    private readonly employeesRepository: Repository<Employee>,
  ) { }

  // **********************************************************************************************************************************************
  async create(createQualificationDto: CreateQualificationDto, user: User): Promise<{ message: string }> {
    const { type, educationLevel, institutionName, country, programName, startDate, endDate, dateAwarded, gradeType, grade, gradePoints, attachment, employeeId } = createQualificationDto;

    // Check if the employee exists
    const checkEmployee = await this.employeesRepository
      .createQueryBuilder('employee')
      .select('employee')
      .where('employee.id = :id', { id: employeeId })
      .getOne();

    if (!checkEmployee) {
      throw new BadRequestException(`Employee with ID: ${employeeId} not found`);
    }

    // Handle the attachment image
    const imageUrl = attachment ? saveImage(attachment, FileType.ATTACHMENT) : null;

    // Create a new Qualification entity
    const qualification = new Qualification();
    qualification.type = type;
    qualification.educationLevel = educationLevel;
    qualification.institutionName = institutionName;
    qualification.country = country;
    qualification.programName = programName;
    qualification.startDate = startDate;
    qualification.endDate = endDate;
    qualification.dateAwarded = dateAwarded;
    qualification.gradeType = gradeType;
    qualification.grade = grade;
    qualification.gradePoints = gradePoints;
    qualification.attachment = imageUrl;
    qualification.employeeId = employeeId;
    qualification.createdBy = user;
    qualification.updatedBy = user;

    // Save the new qualification entity
    await this.qualificationsRepository.save(qualification);

    return { message: 'Qualification created successfully' };
  }

  // **********************************************************************************************************************************************
  async findOne(id: string): Promise<Qualification> {
    // Validate UUID format for ID
    if (!isUUID(id)) {
      throw new BadRequestException('Invalid UUID format');
    }

    // Attempt to find the qualification by UUID
    const qualification = await this.qualificationsRepository.findOne({
      where: { id },
      relations: ['employee'],
    });

    // Throw an error if the qualification is not found
    if (!qualification) {
      throw new NotFoundException(`Qualification with ID ${id} not found`);
    }

    return qualification;
  }

  // **********************************************************************************************************************************************
  async update(
    id: string,
    updateQualificationDto: UpdateQualificationDto,
    user: User,
  ): Promise<{ message: string }> {
    const { type, educationLevel, institutionName, country, programName, startDate, endDate, dateAwarded, gradeType, grade, gradePoints, attachment } =
      updateQualificationDto;
    // Validate UUID format for ID
    if (!isUUID(id)) {
      throw new BadRequestException('Invalid UUID format');
    }

    // Find the qualification to update by UUID
    const qualification = await this.qualificationsRepository.findOne({
      where: { id },
      relations: ['employee'],
    });
    if (!qualification) {
      throw new NotFoundException(`Qualification with ID ${id} not found`);
    }

    // Update other fields, defaulting to existing values if not provided
    qualification.educationLevel = educationLevel || qualification.educationLevel;
    qualification.institutionName = institutionName || qualification.institutionName;
    qualification.dateAwarded = dateAwarded || qualification.dateAwarded;
    qualification.country = country || qualification.country;
    qualification.programName = programName || qualification.programName;
    qualification.startDate = startDate || qualification.startDate;
    qualification.endDate = endDate || qualification.endDate;
    qualification.gradeType = gradeType || qualification.gradeType;
    qualification.grade = grade || qualification.grade;
    qualification.gradePoints = gradePoints || qualification.gradePoints;
    qualification.type = type || qualification.type;
    qualification.attachment = attachment || saveImage(attachment, FileType.ATTACHMENT);
    qualification.updatedBy = user;

    await this.qualificationsRepository.save(qualification);
    return { message: 'Qualification updated successfully' };
  }
}
