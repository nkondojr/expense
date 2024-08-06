import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { isUUID } from 'class-validator';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) { }

  // **********************************************************************************************************************************************
  async create(createCategoryDto: CreateCategoryDto, user_id: string): Promise<{ message: string }> {
    const category = this.categoryRepository.create({
      ...createCategoryDto,
      user: { id: user_id } as any,  // Cast to avoid TypeScript issue
    });

    try {
      await this.categoryRepository.save(category);
      return {
        message: 'Category created successfully',
      };
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException('Category already exists');
      } else {
        throw error;
      }
    }
  }

  // ***********************************************************************************************************************************************
  async findAll(searchTerm?: string, page: number = 1, pageSize: number = 10): Promise<any> {
    const query = this.categoryRepository.createQueryBuilder('category')
      .leftJoinAndSelect('category.user', 'user')
      .select(['category.id', 'category.name', 'user.id', 'user.username']);

    if (searchTerm) {
      query.where('category.name LIKE :searchTerm', { searchTerm: `%${searchTerm}%` });
    }

    query.skip((page - 1) * pageSize).take(pageSize);

    const [categories, total] = await query.getManyAndCount();
    const lastPage = Math.ceil(total / pageSize);

    categories.forEach(category => {
      if (category.user) {
        category['createdBy'] = category.user.id;
        category['userName'] = category.user.username;
        delete category.user;
      }
    });

    return {
      links: {
        next: page < lastPage ? `/categories?page=${page + 1}&pageSize=${pageSize}` : null,
        previous: page > 1 ? `/categories?page=${page - 1}&pageSize=${pageSize}` : null
      },
      count: total,
      lastPage: lastPage,
      currentPage: page,
      data: categories
    };
  }

  // ***********************************************************************************************************************************************
  async findOne(id: string): Promise<Category> {
    // Validate the ID format
    if (!isUUID(id)) {
      throw new BadRequestException('Invalid ID format');
    }

    const category = await this.categoryRepository.findOne({ where: { id }, relations: ['user'] });

    if (!category) {
      throw new NotFoundException(`Category with id ${id} not found`);
    }

    if (category.user) {
      // Exclude the password from the user object
      const { password, validatePassword, ...userWithoutPassword } = category.user;
      category.user = userWithoutPassword as User;
    }

    return category;
  }

  // Update category
  async update(id: string, updateCategoryDto: UpdateCategoryDto, user_id: string): Promise<{ message: string }> {
    if (!isUUID(id)) {
      throw new BadRequestException('Invalid ID format');
    }

    const category = await this.categoryRepository.findOne({ where: { id, user: { id: user_id } } });

    if (!category) {
      throw new NotFoundException(`Category with id ${id} not found`);
    }

    Object.assign(category, updateCategoryDto);

    try {
      await this.categoryRepository.save(category);
      return { message: 'Category updated successfully' };
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException('Duplicate value violates unique constraint');
      } else {
        throw error;
      }
    }
  }

  async remove(id: string, user_id: string): Promise<{ message: string }> {
    if (!isUUID(id)) {
      throw new BadRequestException('Invalid ID format');
    }
  
    const category = await this.categoryRepository.findOne({ where: { id, user: { id: user_id } }, relations: ['products'] });
  
    if (!category) {
      throw new NotFoundException(`Category with id ${id} not found`);
    }
  
    if (category.products.length > 0) {
      throw new BadRequestException('Category cannot be deleted because it has related products');
    }
  
    await this.categoryRepository.remove(category);
  
    return { message: 'Category deleted successfully' };
  }
  

}

