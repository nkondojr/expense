import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { OrganizationService } from './organizations.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { JwtAuthGuard } from 'src/authentication/guards/jwt-auth.guard'; // Assuming you have this guard

@Controller('organizations')
@UseGuards(JwtAuthGuard)
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  @Post()
  @UsePipes(new ValidationPipe())
  async create(@Body() createOrganizationDto: CreateOrganizationDto): Promise<{ message: string }> {
    return this.organizationService.create(createOrganizationDto);
  }

  @Get()
  async findAll(
    @Query('search') search: string,
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 10,
  ): Promise<any> {
    return this.organizationService.findAll(search, page, pageSize);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<any> {
    return this.organizationService.findOne(id);
  }

  @Patch(':id')
  @UsePipes(new ValidationPipe())
  async update(
    @Param('id') id: string,
    @Body() updateOrganizationDto: UpdateOrganizationDto
  ): Promise<{ message: string }> {
    return this.organizationService.update(id, updateOrganizationDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    return this.organizationService.remove(id);
  }
}
