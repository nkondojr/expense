import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Raw, Repository } from 'typeorm';
import { Staff } from '../entities/staff.entity';
import { CreateStaffDto } from '../dto/staffs/create-staff.dto';
import { UpdateStaffDto } from '../dto/staffs/update-staff.dto';
import { isUUID } from 'class-validator';

@Injectable()
export class StaffService {
  constructor(
    @InjectRepository(Staff)
    private staffRepository: Repository<Staff>,
  ) {}

  // ***********************************************************************************************************************************************
  async create(createStaffDto: CreateStaffDto): Promise<{ message: string }> {
    // Trim only the necessary fields
    const trimmedDto = {
      ...createStaffDto,
      empNo: createStaffDto.empNo?.trim(),
      firstName: createStaffDto.firstName?.trim(),
      lastName: createStaffDto.lastName?.trim(),
      email: createStaffDto.email?.trim(),
    };

    const { empNo, firstName, lastName, mobile, email } = trimmedDto;

    // Ensure empNo, firstName, and lastName are provided
    if (!empNo || !firstName || !lastName) {
      throw new BadRequestException(
        'Employee number, firstName, and lastName are required.',
      );
    }

    // Check for duplicate staff by empNo
    const existingStaffByEmpNo = await this.staffRepository.findOne({
      where: {
        empNo: Raw((alias) => `LOWER(TRIM(${alias})) = LOWER(TRIM(:empNo))`, {
          empNo,
        }),
      },
    });
    if (existingStaffByEmpNo) {
      throw new ConflictException(`Staff with empNo ${empNo} already exists.`);
    }

    // Check for duplicate staff by mobile (no TRIM required since it's a numeric field)
    if (mobile) {
      const existingStaffByMobile = await this.staffRepository.findOne({
        where: {
          mobile: Raw((alias) => `${alias} = :mobile`, { mobile }),
        },
      });
      if (existingStaffByMobile) {
        throw new ConflictException(
          `Staff with mobile ${mobile} already exists.`,
        );
      }
    }

    // Check for duplicate staff by email
    if (email) {
      const existingStaffByEmail = await this.staffRepository.findOne({
        where: {
          email: Raw((alias) => `LOWER(TRIM(${alias})) = LOWER(TRIM(:email))`, {
            email,
          }),
        },
      });
      if (existingStaffByEmail) {
        throw new ConflictException(
          `Staff with email ${email} already exists.`,
        );
      }
    }

    // Create new staff entity and save it
    const newStaff = this.staffRepository.create(trimmedDto);

    try {
      // Save staff to the database
      await this.staffRepository.save(newStaff);
      return { message: 'Staff created successfully' };
    } catch (error) {
      // Check if the error is related to a unique constraint violation
      if (error.code === '23505') {
        throw new ConflictException('Duplicate staff details found.');
      }
      // Re-throw other errors
      throw error;
    }
  }

  // ***********************************************************************************************************************************************
  async update(
    uuid: string,
    updateStaffDto: UpdateStaffDto,
  ): Promise<{ message: string }> {
    const { empNo, firstName, lastName, email, mobile } = updateStaffDto;

    // Trim only the necessary string fields
    const trimmedDto = {
      ...updateStaffDto,
      empNo: empNo?.trim(),
      firstName: firstName?.trim(),
      lastName: lastName?.trim(),
      email: email?.trim(),
      mobile, // Assume mobile is numeric or formatted
    };

    // Validate UUID format for ID
    if (!isUUID(uuid)) {
      throw new BadRequestException('Invalid UUID format');
    }

    // Check if the staff exists
    const staff = await this.staffRepository.findOne({
      where: { uuid },
    });
    if (!staff) {
      throw new NotFoundException(`Staff with ID ${uuid} not found.`);
    }

    // Check for duplicates excluding the current staff (only on empNo, email, and mobile)
    const duplicateCheckConditions = [
      { field: 'empNo', value: trimmedDto.empNo },
      { field: 'email', value: trimmedDto.email },
      { field: 'mobile', value: trimmedDto.mobile },
    ];

    for (const condition of duplicateCheckConditions) {
      const isStringField = ['empNo', 'email'].includes(condition.field);

      const existingStaff = await this.staffRepository
        .createQueryBuilder('staff')
        .where(
          isStringField
            ? `LOWER(TRIM(staff.${condition.field})) = LOWER(TRIM(:value))`
            : `staff.${condition.field} = :value`,
          { value: condition.value },
        )
        .andWhere('staff.uuid != :uuid', { uuid })
        .getOne();

      if (existingStaff) {
        throw new ConflictException(
          `Another staff with ${condition.field} ${condition.value} already exists.`,
        );
      }
    }

    // Update the staff entity
    Object.assign(staff, trimmedDto);

    try {
      await this.staffRepository.save(staff);
      return { message: 'Staff updated successfully' };
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException('Duplicate staff details found.');
      }
      throw error;
    }
  }
}
