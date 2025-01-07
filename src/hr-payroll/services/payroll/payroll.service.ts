import { Repository } from 'typeorm';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { isUUID } from 'class-validator';
import { SearchParams } from 'utils/search-parms.util';
import { buildPaginationResponse, paginate } from 'utils/pagination.utils';
import { Payroll } from 'src/hr-payroll/entities/payroll/payroll.entity';
import { Employee } from 'src/hr-payroll/entities/employees/employees.entity';
import { FinancialYear } from 'src/organizations/entities/financial-years/financial-year.entity';
import { CreatePayrollDto } from 'src/hr-payroll/dto/payroll/create-payroll.dto';

@Injectable()
export class PayrollsService {
  constructor(
    @InjectRepository(Payroll)
    private readonly payrollsRepository: Repository<Payroll>,

    @InjectRepository(FinancialYear)
    private readonly financialYearsRepository: Repository<FinancialYear>,

    @InjectRepository(Employee)
    private readonly employeesRepository: Repository<Employee>,

  ) { }

  // ***********************************************************************************************************************************************
  async create(createPayrollDto: CreatePayrollDto): Promise<{ message: string }> {
    const { date, financialYearId, employeeIds } = createPayrollDto;

    // Ensure date is not in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set time to the day for comparison

    if (new Date(date) > today) {
      throw new BadRequestException('The date cannot be in the after today.');
    }

    // Check if the financialYear exists
    const checkFinancialYear = await this.financialYearsRepository.findOne({ where: { id: financialYearId } });

    if (!checkFinancialYear) {
      throw new BadRequestException(`Financial year with ID: ${financialYearId} not found`);
    }

    if (!checkFinancialYear.isClosed) {
      throw new BadRequestException(`Financial year with ID: ${financialYearId} is closed`);
    }

    for (const employeeId of employeeIds) {
      // Check if the employee exists
      const checkEmployee = await this.employeesRepository.findOne({ where: { id: employeeId } });

      if (!checkEmployee) {
        throw new BadRequestException(`Employee with ID: ${employeeId} not found`);
      }

      if (!checkEmployee.isActive) {
        throw new BadRequestException(`Employee with ID: ${employeeId} is not active`);
      }

      // Check for existing date ranges
      const existingPayroll = await this.payrollsRepository
        .createQueryBuilder('payroll')
        .where('payroll.financialYear = :financialYearId', { financialYearId })
        .andWhere('payroll.employee = :employeeId', { employeeId })
        .andWhere('payroll.date = :date', { date })
        .getOne();

      if (existingPayroll) {
        throw new BadRequestException(
          `Payroll for date ${date} and employee ID ${employeeId} already exists`,
        );
      }

      // Generate the 'number' value
      const [lastFarm] = await this.payrollsRepository.find({
        order: { createdAt: 'DESC' },
        take: 1,
      });

      const newNumber = lastFarm
        ? `PAYRL-${(parseInt(lastFarm.number.split('-')[1], 10) + 1).toString().padStart(4, '0')}`
        : 'PAYRL-001';

      // Create and save a new Payroll entity
      const newPayroll = this.payrollsRepository.create({
        date,
        financialYear: checkFinancialYear,
        employee: checkEmployee,
        number: newNumber,
      });

      await this.payrollsRepository.save(newPayroll);
    }

    return {
      message: 'Payroll created successfully',
    };
  }

  // ***********************************************************************************************************************************************
  async findAll(searchParams: SearchParams): Promise<any> {
    const { searchTerm, page, pageSize } = searchParams;

    const query = this.payrollsRepository
      .createQueryBuilder('payrolls')
      .leftJoin('payrolls.financialYear', 'financialYear')
      .leftJoin('payrolls.employee', 'employee')
      .leftJoin('employee.user', 'user')
      .select([
        'payrolls',
        'financialYear.name',
        'employee.title',
        'employee.tin',
        'employee.regNumber',
        'user.username',
        'user.mobile',
        'user.email',
      ]);

    if (searchTerm) {
      query.where(
        `employee.regNumber ILIKE :searchTerm
          OR CAST(employee.tin AS TEXT) ILIKE :searchTerm
          OR CAST(employee.title AS TEXT) ILIKE :searchTerm
          OR user.username ILIKE :searchTerm
          OR CAST(user.mobile AS TEXT) ILIKE :searchTerm
          OR user.email ILIKE :searchTerm`,
        {
          searchTerm: `%${searchTerm}%`,
        },
      )
        .orWhere("TO_CHAR(payrolls.date, 'DD-MM-YYYY') ILIKE :searchTerm", {
          searchTerm: `%${searchTerm}%`,
        })
        .orWhere(
          `CONCAT(employee.title, ' ', user.username) ILIKE :searchTerm`,
          { searchTerm: `%${searchTerm}%` },
        );
    }

    // Apply pagination using the utility function
    paginate(query, page, pageSize);

    // Execute query and get results with count
    const [payrolls, total] = await query.getManyAndCount();

    // Build the pagination response using the utility function
    return buildPaginationResponse(
      payrolls,
      total,
      page,
      pageSize,
      '/payrolls',
    );
  }

  // ***********************************************************************************************************************************************
  async findUnassignedEmployees(
    date: string,
  ): Promise<Employee[]> {

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set time to the of the day for comparison

    // Validation: Return an empty array if date is in the past
    if (new Date(date) > today) {
      return [];
    }

    const unassignedEmployees = await this.employeesRepository
      .createQueryBuilder('employee')
      .leftJoin('employee.payrolls', 'payroll')
      .leftJoin('employee.user', 'user')
      .andWhere('payroll.date = :date', { date })
      .andWhere('employee.isActive = :isActive', { isActive: 'true' })
      .select([
        'employee.id',
        'employee.title',
        'employee.regNumber',
        'user.username',
        'user.mobile',
        'user.email',
      ])
      .getMany();

    return unassignedEmployees;
  }

  // ***********************************************************************************************************************************************
  async findOne(id: string): Promise<Payroll> {
    if (!isUUID(id)) {
      throw new BadRequestException('Invalid ID format');
    }
    const financialYear = await this.payrollsRepository.findOne({
      where: { id },
      relations: [
        'financialYear', 'employee'
      ],
    });
    if (!financialYear) {
      throw new NotFoundException(`Payroll with ID: ${id} not found.`);
    }
    return financialYear;
  }
}
