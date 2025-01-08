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
import { PayrollItem } from 'src/hr-payroll/entities/payroll/payroll-items.entity';

@Injectable()
export class PayrollsService {
  constructor(
    @InjectRepository(Payroll)
    private readonly payrollsRepository: Repository<Payroll>,

    @InjectRepository(PayrollItem)
    private readonly payrollItemsRepository: Repository<PayrollItem>,

    @InjectRepository(FinancialYear)
    private readonly financialYearsRepository: Repository<FinancialYear>,

    @InjectRepository(Employee)
    private readonly employeesRepository: Repository<Employee>,

  ) { }

  // ***********************************************************************************************************************************************
  async create(createPayrollDto: CreatePayrollDto): Promise<{ message: string }> {
    const { date, financialYearId, payrollItems } = createPayrollDto;

    if (!payrollItems || payrollItems.length === 0) {
      throw new BadRequestException('Payroll items cannot be empty');
    }

    // Ensure date is not in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set time to the day for comparison

    if (new Date(date) > today) {
      throw new BadRequestException('The date cannot be after today.');
    }

    // Check if the financialYear exists
    const checkFinancialYear = await this.financialYearsRepository.findOne({
      where: { id: financialYearId },
    });

    if (!checkFinancialYear) {
      throw new BadRequestException(`Financial year with ID: ${financialYearId} not found`);
    }

    if (!checkFinancialYear.isClosed) {
      throw new BadRequestException(`Financial year with ID: ${financialYearId} is closed`);
    }

    for (const item of payrollItems) {
      // Check if the employee exists
      const checkEmployee = await this.employeesRepository.findOne({
        where: { id: item.employeeId },
        relations: ['allocations'],
      });

      if (!checkEmployee) {
        throw new BadRequestException(`Employee with ID: ${item.employeeId} not found`);
      }

      if (!checkEmployee.isActive) {
        throw new BadRequestException(`Employee with ID: ${item.employeeId} is not active`);
      }

      // Check for existing payroll within one month for the same employee
      const oneMonthBefore = new Date(date);
      oneMonthBefore.setMonth(oneMonthBefore.getMonth() - 1);

      const oneMonthAfter = new Date(date);
      oneMonthAfter.setMonth(oneMonthAfter.getMonth() + 1);

      const existingPayroll = await this.payrollsRepository
        .createQueryBuilder('payroll')
        .leftJoinAndSelect('payroll.payrollItems', 'payrollItems')
        .where('payrollItems.employeeId = :employeeId', { employeeId: item.employeeId })
        .andWhere('payroll.date BETWEEN :oneMonthBefore AND :oneMonthAfter', {
          oneMonthBefore,
          oneMonthAfter,
        })
        .getOne();

      if (existingPayroll) {
        throw new BadRequestException(
          `Payroll already exists within one month range for employee ID ${item.employeeId}`,
        );
      }

      // Generate the 'number' value
      const [lastPayroll] = await this.payrollsRepository.find({
        order: { createdAt: 'DESC' },
        take: 1,
      });

      const newNumber = lastPayroll
        ? `PAYRL-${(parseInt(lastPayroll.number.split('-')[1], 10) + 1).toString().padStart(4, '0')}`
        : 'PAYRL-001';

      // Create and save a new Payroll entity
      const newPayroll = this.payrollsRepository.create({
        date,
        financialYear: checkFinancialYear,
        number: newNumber,
      });

      const savedPayroll = await this.payrollsRepository.save(newPayroll);

      // Create payroll items
      const payrollItemsEntities = [];

      for (const item of payrollItems) {
        const employeeBank = checkEmployee.allocations.find(
          (allocation) => allocation.isActive, // Assuming a field to determine active bank
        );

        if (!employeeBank) {
          throw new BadRequestException(
            `No active EmployeeBank found for employee ID ${item.employeeId}`,
          );
        }

        const payrollItem = new PayrollItem();
        payrollItem.totalCost = employeeBank.basicSalary;
        payrollItem.grossSalary = employeeBank.basicSalary;
        payrollItem.basicSalary = employeeBank.basicSalary; // Fetching from EmployeeBank
        payrollItem.taxableIncome = employeeBank.basicSalary;
        payrollItem.netSalary = employeeBank.basicSalary;
        payrollItem.payroll = savedPayroll;
        payrollItem.employee = { id: item.employeeId } as any; // Assuming employee entity is referenced by ID
        payrollItemsEntities.push(payrollItem);
      }

      // Save payroll items
      await this.payrollItemsRepository.save(payrollItemsEntities);
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
