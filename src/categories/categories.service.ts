import { Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto, userId: string): Promise<Category> {
    const category = this.categoryRepository.create({
      ...createCategoryDto,
      user: { id: userId } as any,  // Cast to avoid TypeScript issue
    });
    return this.categoryRepository.save(category);
  }

  async findAll(): Promise<Category[]> {
    const categories = await this.categoryRepository.find({ relations: ['user'] });
    
    categories.forEach(category => {
      if (category.user) {
        category['createdBy'] = category.user.id;
        category['username'] = category.user.fullName;
        delete category.user;
      }
    });
    return categories;
  }

  async findOne(id: string): Promise<Category> {
    const category = await this.categoryRepository.findOne({ where: { id }, relations: ['user'] });

    if (category && category.user) {
      // Exclude the password from the user object
      const { password, validatePassword, ...userWithoutPassword } = category.user;
      category.user = userWithoutPassword as User;
    }
    return category;
  }

}

