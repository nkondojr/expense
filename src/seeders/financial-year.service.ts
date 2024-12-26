import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FinancialYear } from 'src/organizations/entities/financial-years/financial-year.entity';
import { Repository } from 'typeorm';
import { buildPaginationResponse } from 'utils/pagination.utils';
import { SearchParams } from 'utils/search-parms.util';

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
        isClosed: true,
      },
      {
        id: 2,
        name: 'FY2025',
        startDate: '2025-01-01',
        endDate: '2025-12-31',
        isClosed: false,
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

  // ***********************************************************************************************************************************************
  async findAllFinancialYear(searchParams: SearchParams): Promise<any> {
    const { searchTerm, page, pageSize } = searchParams;

    const currentYear = new Date().getFullYear();
    const financialYearName = `FY${currentYear}`;

    await this.financialYearRepository.update(
      {
        name: financialYearName,
      },
      { isClosed: false },
    );

    const query = this.financialYearRepository
      .createQueryBuilder('years')
      .select(['years']);

    if (searchTerm) {
      query.where('(years.name ILIKE :searchTerm)', {
        searchTerm: `%${searchTerm}%`,
      });
    }

    query.skip((page - 1) * pageSize).take(pageSize);

    const [financialYears, total] = await query.getManyAndCount();

    return buildPaginationResponse(
      financialYears,
      total,
      page,
      pageSize,
      '/financial-years',
    );
  }
}
