import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  UsePipes,
  Body,
  UseGuards,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/authentication/guards/jwt-auth.guard';
import { CreatePayrollDto } from 'src/hr-payroll/dto/payroll/create-payroll.dto';
import { PayrollsService } from 'src/hr-payroll/services/payroll/payroll.service';
import { SearchParams } from 'utils/search-parms.util';

@Controller('hr-payroll')
@UseGuards(JwtAuthGuard)
export class PayrollsController {
  constructor(private readonly payrollsService: PayrollsService) { }

  @Post()
  @UsePipes(CreatePayrollDto)
  async create(@Body() createPayrollDto: CreatePayrollDto) {
    return await this.payrollsService.create(createPayrollDto);
  }

  @Get()
  async getAll(
    @Query('search') search?: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ): Promise<any> {
    const searchParams = new SearchParams(search, page, pageSize);
    return this.payrollsService.findAll(searchParams);
  }

  @Get('unpayed-employees')
  async findUnpayedEmployees(
    @Query('date') date: string,
  ) {
    if (!date) {
      throw new BadRequestException('date an are required');
    }
    return this.payrollsService.findUnpayedEmployees(date);
  }

  @Get(':uuid')
  async findOne(@Param('uuid', ParseUUIDPipe) uuid: string) {
    return await this.payrollsService.findOne(uuid);
  }
}
