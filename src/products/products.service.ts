import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';
// import { Category } from '@/categories/entities/category.entity.ts'; // Adjust this path as needed
import { saveImage } from 'utils/image.utils';
import { isUUID } from 'class-validator';
import { Category } from 'src/categories/entities/category.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,

    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) { }

  // ***********************************************************************************************************************************************
  async create(createProductDto: CreateProductDto): Promise<{ message: string }> {
    const { name, price, description, image, categoryId } = createProductDto;

    // Validate that category exists
    const categoryExists = await this.categoryRepository.findOne({ where: { id: categoryId } });
    if (!categoryExists) {
      throw new NotFoundException(`Category with id ${categoryId} not found`);
    }

    const imageUrl = saveImage(image);

    const product = new Product();
    product.name = name;
    product.price = price;
    product.description = description;
    product.image = imageUrl;
    product.categoryId = categoryId;

    try {
      await this.productRepository.save(product);
      return {
        message: 'Product created successfully',
      };
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException('Product already exists');
      } else {
        throw error;
      }
    }
  }

  // ***********************************************************************************************************************************************
  async findAll(searchTerm?: string, page: number = 1, pageSize: number = 10): Promise<any> {
    const query = this.productRepository.createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .select([
        'product.id',
        'product.name',
        'product.price',
        'product.description',
        'product.image',
        'product.categoryId',
        'product.createdAt',
        'category.name',
      ]);

    if (searchTerm) {
      query.where('product.name LIKE :searchTerm OR category.name LIKE :searchTerm', { searchTerm: `%${searchTerm}%` });
    }

    query.skip((page - 1) * pageSize).take(pageSize);

    const [products, total] = await query.getManyAndCount();
    const lastPage = Math.ceil(total / pageSize);

    products.forEach(product => {
      if (product.category) {
        product['category_name'] = product.category.name;
        delete product.category;
      }
    });

    return {
      links: {
        next: page < lastPage ? `/products?page=${page + 1}&pageSize=${pageSize}` : null,
        previous: page > 1 ? `/products?page=${page - 1}&pageSize=${pageSize}` : null
      },
      count: total,
      lastPage: lastPage,
      currentPage: page,
      data: products
    };
  }

  // ***********************************************************************************************************************************************
  async findOne(id: string): Promise<any> {
    // Validate the ID format
    if (!isUUID(id)) {
      throw new BadRequestException('Invalid ID format');
    }

    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['category'],
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    // Transform the product object
    const result = {
      id: product.id,
      name: product.name,
      price: product.price,
      category_name: product.category.name,
    };

    return result;
  }
}
