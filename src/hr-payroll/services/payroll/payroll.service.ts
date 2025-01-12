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
import { CalculatedFrom, DeductionNature, GeneralDeduction } from 'src/hr-payroll/entities/payroll/general-deductions.entity';
import { IndividualDeduction } from 'src/hr-payroll/entities/payroll/individial-deductions.entity';
import { Transaction, TransactionType } from 'src/accounts/entities/transaction.entity';
import { Nature } from 'src/accounts/entities/class.entity';

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

    @InjectRepository(GeneralDeduction)
    private readonly generalDeductionsRepository: Repository<GeneralDeduction>,

    @InjectRepository(IndividualDeduction)
    private readonly individualDeductionsRepository: Repository<IndividualDeduction>,

    @InjectRepository(Transaction)
    private readonly transactionsRepository: Repository<Transaction>,

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

    if (checkFinancialYear.isClosed) {
      throw new BadRequestException(`Financial year with ID: ${financialYearId} is closed`);
    }

    const payrollItemsEntities = [];
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

      // Find the active employee allocation
      const employeeAllocation = checkEmployee.allocations.find(
        (allocation) => allocation.isActive, // Assuming a field to determine active bank
      );

      if (!employeeAllocation) {
        throw new BadRequestException(
          `No active EmployeeBank found for employee ID ${item.employeeId}`,
        );
      }

      const payrollItem = new PayrollItem();
      payrollItem.employee = { id: item.employeeId } as any; // Assuming employee entity is referenced by ID
      payrollItemsEntities.push(payrollItem);
    }

    // Generate the 'number' value
    const [lastPayroll] = await this.payrollsRepository.find({
      order: { createdAt: 'DESC' },
      take: 1,
    });

    const newNumber = lastPayroll
      ? `PAYRL-${(parseInt(lastPayroll.number.split('-')[1], 10) + 1).toString().padStart(4, '0')}`
      : 'PAYRL-0001';

    // Create and save a new Payroll entity
    const newPayroll = this.payrollsRepository.create({
      date,
      financialYear: checkFinancialYear,
      number: newNumber,
    });

    const savedPayroll = await this.payrollsRepository.save(newPayroll);

    // Associate payroll items with the saved payroll
    payrollItemsEntities.forEach((item) => {
      item.payroll = savedPayroll;
    });

    // Save payroll items
    await this.payrollItemsRepository.save(payrollItemsEntities);

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
      .select([
        'payrolls',
        'financialYear.name',
      ]);

    if (searchTerm) {
      query.where(`financialYear.name ILIKE :searchTerm`,
        {
          searchTerm: `%${searchTerm}%`,
        },
      )
        .orWhere("TO_CHAR(payrolls.date, 'DD-MM-YYYY') ILIKE :searchTerm", {
          searchTerm: `%${searchTerm}%`,
        });
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
  async findAllGeneralDeductions(searchParams: SearchParams): Promise<any> {
    const { searchTerm, page, pageSize } = searchParams;

    const query = this.generalDeductionsRepository.createQueryBuilder('generalDeduction');

    if (searchTerm) {
      query.where('generalDeduction.name ILIKE :searchTerm', { searchTerm: `%${searchTerm}%` });
    }

    paginate(query, page, pageSize);

    const [generalDeductions, total] = await query.getManyAndCount();

    return buildPaginationResponse(generalDeductions, total, page, pageSize, '/general-deductions');
  }

  // ***********************************************************************************************************************************************
  async findAllIndividualDeductions(searchParams: SearchParams): Promise<any> {
    const { searchTerm, page, pageSize } = searchParams;

    const query = this.individualDeductionsRepository
      .createQueryBuilder('individualDeductions')
      .leftJoinAndSelect('individualDeductions.employee', 'employee')
      .leftJoinAndSelect('employee.user', 'user')
      .select([
        'individualDeductions',
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
          OR CAST(employee.placeOfBirth AS TEXT) ILIKE :searchTerm
          OR CAST(employee.employmentNumber AS TEXT) ILIKE :searchTerm
          OR CAST(employee.maritalStatus AS TEXT) ILIKE :searchTerm
          OR CAST(employee.pensionNumber AS TEXT) ILIKE :searchTerm
          OR employee.district ILIKE :searchTerm
          OR CAST(employee.idNumber AS TEXT) ILIKE :searchTerm
          OR employee.ward ILIKE :searchTerm
          OR employee.street ILIKE :searchTerm
          OR CAST(employee.idType AS TEXT) ILIKE :searchTerm
          OR CAST(employee.employmentType AS TEXT) ILIKE :searchTerm
          OR CAST(employee.title AS TEXT) ILIKE :searchTerm
          OR CAST(individualDeductions.name AS TEXT) ILIKE :searchTerm
          OR CAST(individualDeductions.value AS TEXT) ILIKE :searchTerm
          OR CAST(individualDeductions.number AS TEXT) ILIKE :searchTerm
          OR CAST(individualDeductions.deductionPeriod AS TEXT) ILIKE :searchTerm
          OR CAST(individualDeductions.calculateFrom AS TEXT) ILIKE :searchTerm
          OR CAST(individualDeductions.nature AS TEXT) ILIKE :searchTerm
          OR user.username ILIKE :searchTerm
          OR CAST(user.mobile AS TEXT) ILIKE :searchTerm
          OR user.email ILIKE :searchTerm`,
        {
          searchTerm: `%${searchTerm}%`,
        },
      )
        .orWhere("TO_CHAR(employee.dob, 'DD-MM-YYYY') ILIKE :searchTerm", {
          searchTerm: `%${searchTerm}%`,
        })
        .orWhere("TO_CHAR(employee.employmentDate, 'DD-MM-YYYY') ILIKE :searchTerm", {
          searchTerm: `%${searchTerm}%`,
        })
        .orWhere("TO_CHAR(individualDeductions.effectiveDate, 'DD-MM-YYYY') ILIKE :searchTerm", {
          searchTerm: `%${searchTerm}%`,
        })
        .orWhere(
          `CONCAT(employee.title, ' ', user.username) ILIKE :searchTerm`,
          { searchTerm: `%${searchTerm}%` },
        );
    }

    paginate(query, page, pageSize);

    const [individualDeductions, total] = await query.getManyAndCount();

    return buildPaginationResponse(individualDeductions, total, page, pageSize, '/individual-deductions');
  }

  // ***********************************************************************************************************************************************
  async findUnpayedEmployees(date: string): Promise<Employee[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set time to the start of the day for comparison

    // Validation: Return an empty array if date is in the past
    if (new Date(date) > today) {
      return [];
    }

    const unpayedEmployees = await this.employeesRepository
      .createQueryBuilder('employee')
      .leftJoin('employee.payrollItems', 'payrollItems')
      .leftJoin('payrollItems.payroll', 'payroll')
      .leftJoin('employee.user', 'user')
      .andWhere('employee.isActive = :isActive', { isActive: 'true' })
      .andWhere(
        'payroll.date IS NULL OR payroll.date < :date', // No payroll or payroll date before the selected date
        { date }
      )
      .select([
        'employee.id',
        'employee.title',
        'employee.regNumber',
        'user.username',
        'user.mobile',
        'user.email',
      ])
      .getMany();

    return unpayedEmployees;
  }

  // ***********************************************************************************************************************************************
  async findOne(id: string): Promise<Payroll> {
    if (!isUUID(id)) {
      throw new BadRequestException('Invalid ID format');
    }
    const financialYear = await this.payrollsRepository.findOne({
      where: { id },
      relations: ['financialYear', 'payrollItems', 'payrollItems.employee', 'payrollItems.employee.user'],
    });
    if (!financialYear) {
      throw new NotFoundException(`Payroll with ID: ${id} not found.`);
    }
    return financialYear;
  }

  // ***********************************************************************************************************************************************
  // calculatePayeValue(amount: number): number {
  //   const value = new Decimal(amount);
  //   if (value.gt(1000000)) {
  //     return new Decimal(128000).plus(value.minus(1000000).times(0.3)).toNumber();
  //   } else if (value.gt(760000)) {
  //     return new Decimal(68000).plus(value.minus(760000).times(0.25)).toNumber();
  //   } else if (value.gt(520000)) {
  //     return new Decimal(20000).plus(value.minus(520000).times(0.2)).toNumber();
  //   } else if (value.gt(270000)) {
  //     return value.minus(270000).times(0.08).toNumber();
  //   } else {
  //     return 0;
  //   }
  // }

  // private async calculateDeductions(
  //   employee: Employee,
  //   basicSalary: number,
  //   grossSalary: number,
  //   taxableIncome: number,
  //   deductions: GeneralDeduction[],
  //   payroll: Payroll,
  // ): Promise<{
  //   totalValue: number;
  //   transactions: Transaction[];
  //   individualDeductions: any[];
  //   generalDeductions: any[];
  // }> {
  //   let totalValue = 0;
  //   const transactions: Transaction[] = [];
  //   const individualDeductions = [];
  //   const generalDeductions = [];

  //   for (const deduction of deductions) {
  //     let amount = 0;
  //     const calculateFromValue =
  //       deduction.calculateFrom === CalculatedFrom.BASIC_SALARY
  //         ? basicSalary
  //         : deduction.calculateFrom === CalculatedFrom.GROSS_SALARY
  //         ? grossSalary
  //         : taxableIncome;

  //     if (deduction.nature === DeductionNature.CONSTANT) {
  //       amount = Number(deduction.value);
  //     } else {
  //       amount = calculateFromValue * (Number(deduction.value) / 100);
  //     }

  //     totalValue += amount;

  //     // Group deductions and prepare transactions
  //     if (deduction.employee) {
  //       individualDeductions.push({
  //         payroll,
  //         employee,
  //         amount,
  //       });
  //     } else {
  //       generalDeductions.push({
  //         payroll,
  //         deduction,
  //         amount,
  //         employee,
  //       });
  //     }

  //     transactions.push(
  //       new Transaction({
  //         account: deduction.liabilityAccount,
  //         nature: Nature.CREDITOR,
  //         type: TransactionType.PAYROLL,
  //         amount,
  //         date: payroll.date,
  //       }),
  //       new Transaction({
  //         account: deduction.expenseAccount,
  //         nature: Nature.DEBITOR,
  //         type: TransactionType.PAYROLL,
  //         amount,
  //         date: payroll.date,
  //       }),
  //     );
  //   }

  //   return { totalValue, transactions, individualDeductions, generalDeductions };
  // }

  // async approvePayroll(payrollId: string, approvalDate: Date): Promise<void> {
  //   const payroll = await this.payrollsRepository.findOne({
  //     where: { id: payrollId },
  //     relations: ['employees'],
  //   });
  //   if (!payroll) {
  //     throw new BadRequestException('Payroll not found');
  //   }

  //   payroll.status = 'Approved';
  //   payroll.approvedAt = approvalDate;

  //   const deductions = await this.generalDeductionsRepository.find({ where: { isActive: true } });

  //   for (const employee of payroll.employees) {
  //     const basicSalary = employee.basicSalary || 0;
  //     const grossSalary = basicSalary; // Adjust as per business logic
  //     const taxableIncome = grossSalary; // Adjust as needed

  //     const { totalValue, transactions } = await this.calculateDeductions(
  //       employee,
  //       basicSalary,
  //       grossSalary,
  //       taxableIncome,
  //       deductions,
  //       payroll,
  //     );

  //     payroll.totalAmount += totalValue;

  //     // Save transactions
  //     await this.transactionsRepository.save(transactions);
  //   }

  //   await this.payrollsRepository.save(payroll);
  // }
}
