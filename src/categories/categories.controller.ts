import { Controller, Get, Post, Body, Param, UseGuards, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { User } from 'src/users/entities/user.entity';
import { JwtAuthGuard } from 'src/authentication/guards/jwt-auth.guard';
import { GetUser } from 'src/authentication/decorators/get-user.decorator';
import { Category } from './entities/category.entity';

@Controller('categories')
@UseGuards(JwtAuthGuard)
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @UsePipes(new ValidationPipe())
  async create(@Body() createCategoryDto: CreateCategoryDto, @GetUser() user: User) {
    return this.categoriesService.create(createCategoryDto, user.id);
  }

  @Get()
  async findAll(
    @Query('search') search: string,
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 10,
  ): Promise<any> {
    return this.categoriesService.findAll(search, page, pageSize);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Category> {
    return this.categoriesService.findOne(id);
  }
}
