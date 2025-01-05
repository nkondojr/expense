import {
  Controller,
  Get,
  Param,
  Query,
  UsePipes,
  ValidationPipe,
  Body,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/authentication/guards/jwt-auth.guard';
import { SearchParams } from 'utils/search-parms.util';
import { EmployeesService } from '../../services/employees/employees.service';
import { CreateEmployeeDto } from '../../dto/employees/create-employee.dto';
import { UpdateEmployeeDto } from '../../dto/employees/update-employee.dto';

@Controller('hr-payroll/employees')
@UseGuards(JwtAuthGuard)
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) { }

  @Post()
  @UsePipes(new ValidationPipe())
  async create(@Body() createEmployeeDto: CreateEmployeeDto) {
    return this.employeesService.create(createEmployeeDto);
  }

  @Get()
  async findAll(
    @Query('search') search: string,
    @Query('page') page: number,
    @Query('pageSize') pageSize: number,
  ): Promise<any> {
    const searchParams = new SearchParams(search, page, pageSize);
    return this.employeesService.findAll(searchParams);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const user = await this.employeesService.findOne(id);
    return user;
  }

  @Patch(':id')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async update(
    @Param('id') id: string,
    @Body() updateEmployeeDto: UpdateEmployeeDto,
  ) {
    const user = await this.employeesService.update(id, updateEmployeeDto);
    return user;
  }

  @Patch(':id/activate-deactivate')
  async toggleEmployeeStatus(
    @Param('id') id: string,
  ): Promise<{ message: string }> {
    return this.employeesService.toggleEmployeeStatus(id);
  }
}
