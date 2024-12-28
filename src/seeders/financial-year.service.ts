import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FinancialYear } from 'src/organizations/entities/financial-years/financial-year.entity';
import { Repository } from 'typeorm';

@Injectable()
export class FinancialYearService {
  constructor(
    @InjectRepository(FinancialYear)
    private financialYearRepository: Repository<FinancialYear>,
  ) {}

  // ***********************************************************************************************************************************************
  async seed() {
    const years = [
      {
        id: 1,
        name: 'FY2024',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        isClosed: false,
      },
      {
        id: 2,
        name: 'FY2025',
        startDate: '2025-01-01',
        endDate: '2025-12-31',
        isClosed: true,
      }
    ];

    for (const year of years) {
      const existing = await this.financialYearRepository.findOneBy({
        name: year.name,
      });
      if (!existing) {
        await this.financialYearRepository.save(year);
      }
    }
  }
}
