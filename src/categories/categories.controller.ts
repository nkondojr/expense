import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { User } from 'src/users/entities/user.entity';
import { JwtAuthGuard } from 'src/authentication/guards/jwt-auth.guard';
import { GetUser } from 'src/authentication/decorators/get-user.decorator';
import { Category } from './entities/category.entity';
// import { GetUser } from '../auth/get-user.decorator';

@Controller('api/categories')
@UseGuards(JwtAuthGuard)
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  async create(@Body() createCategoryDto: CreateCategoryDto, @GetUser() user: User) {
    return this.categoriesService.create(createCategoryDto, user.id);
  }

  @Get()
  async findAll() {
    return this.categoriesService.findAll();
  }

  // @Get(':id')
  // async findOne(@Param('id') id: string) {
  //   return this.categoriesService.findOne(id);
  // }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Category> {
    return this.categoriesService.findOne(id);
  }
}
