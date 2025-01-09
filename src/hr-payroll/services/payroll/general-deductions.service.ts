// GeneralDeductionsService
import { Repository } from 'typeorm';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { GeneralDeduction } from 'src/hr-payroll/entities/payroll/general-deductions.entity';
import { CreateGeneralDeductionDto } from 'src/hr-payroll/dto/payroll/general/create-general.dto';

@Injectable()
export class GeneralDeductionsService {
  constructor(
    @InjectRepository(GeneralDeduction)
    private readonly generalDeductionsRepository: Repository<GeneralDeduction>,
  ) { }

  // ***********************************************************************************************************************************************
  async create(createGeneralDeductionDto: CreateGeneralDeductionDto): Promise<{ message: string }> {
    const { name, type, transactionType, nature, value, calculateFrom } = createGeneralDeductionDto;

    // Check if a general deduction with the same name exists
    const existingDeduction = await this.generalDeductionsRepository.findOne({ where: { name } });

    if (existingDeduction) {
      throw new BadRequestException(`General deduction with name ${name} already exists.`);
    }

    const generalDeduction = this.generalDeductionsRepository.create({
      name,
      type,
      transactionType,
      nature,
      value,
      calculateFrom,
    });

    await this.generalDeductionsRepository.save(generalDeduction);

    return { message: 'General deduction created successfully' };
  }

  // ***********************************************************************************************************************************************
  async findOne(id: string): Promise<GeneralDeduction> {
    const generalDeduction = await this.generalDeductionsRepository.findOne({ where: { id } });

    if (!generalDeduction) {
      throw new NotFoundException(`General deduction with ID ${id} not found.`);
    }

    return generalDeduction;
  }
}
