import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { isUUID } from 'class-validator';
import { Organization } from './entities/organization.entity';

@Injectable()
export class OrganizationService {
  constructor(
    @InjectRepository(Organization)
    private readonly organizationRepository: Repository<Organization>,
  ) {}

  // ***********************************************************************************************************************************************
  async create(createOrganizationDto: CreateOrganizationDto): Promise<{ message: string }> {
    const { name, reg_no, region, address, phone_no, tin_no, website } = createOrganizationDto;

    const organization = new Organization();
    organization.name = name;
    organization.reg_no = reg_no;
    organization.region = region;
    organization.address = address;
    organization.phone_no = phone_no;
    organization.tin_no = tin_no;
    organization.website = website;

    try {
      await this.organizationRepository.save(organization);
      return { message: 'Organization created successfully' };
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException('Organization already exists');
      } else {
        throw error;
      }
    }
  }

  // ***********************************************************************************************************************************************
  async findAll(searchTerm?: string, page: number = 1, pageSize: number = 10): Promise<any> {
    const query = this.organizationRepository.createQueryBuilder('organization')
      .select([
        'organization.id',
        'organization.name',
        'organization.reg_no',
        'organization.region',
        'organization.address',
        'organization.phone_no',
        'organization.tin_no',
        'organization.website',
      ]);

    if (searchTerm) {
      query.where('organization.name LIKE :searchTerm', { searchTerm: `%${searchTerm}%` });
    }

    query.skip((page - 1) * pageSize).take(pageSize);

    const [organizations, total] = await query.getManyAndCount();
    const lastPage = Math.ceil(total / pageSize);

    return {
      links: {
        next: page < lastPage ? `/organizations?page=${page + 1}&pageSize=${pageSize}` : null,
        previous: page > 1 ? `/organizations?page=${page - 1}&pageSize=${pageSize}` : null
      },
      count: total,
      lastPage: lastPage,
      currentPage: page,
      data: organizations
    };
  }

  // ***********************************************************************************************************************************************
  async findOne(id: string): Promise<any> {
    // Validate the ID format (assuming it's UUID)
    if (!isUUID(id)) {
      throw new BadRequestException('Invalid ID format');
    }
  
    const organization = await this.organizationRepository.findOne({
      where: { id },
    });
  
    if (!organization) {
      throw new NotFoundException(`Organization with ID ${id} not found`);
    }
  
    return {
      id: organization.id,
      name: organization.name,
      reg_no: organization.reg_no,
      region: organization.region,
      address: organization.address,
      phone_no: organization.phone_no,
      tin_no: organization.tin_no,
      website: organization.website,
    };
  }
  
  // ***********************************************************************************************************************************************
  async update(id: string, updateOrganizationDto: UpdateOrganizationDto): Promise<{ message: string }> {
    if (!isUUID(id)) {
      throw new BadRequestException('Invalid ID format');
    }

    const organization = await this.organizationRepository.preload({
      id,
      ...updateOrganizationDto,
    });

    if (!organization) {
      throw new NotFoundException(`Organization with ID ${id} not found`);
    }

    try {
      await this.organizationRepository.save(organization);
      return { message: 'Organization updated successfully' };
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException('Organization already exists');
      } else {
        throw error;
      }
    }
  }

  // ***********************************************************************************************************************************************
  async remove(id: string): Promise<{ message: string }> {
    if (!isUUID(id)) {
      throw new BadRequestException('Invalid ID format');
    }

    const result = await this.organizationRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Organization with ID ${id} not found`);
    }

    return { message: 'Organization deleted successfully' };
  }
}
