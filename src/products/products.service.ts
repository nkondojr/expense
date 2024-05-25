import { Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';
import { saveImage } from 'utils/image.utils';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const { name, price, description, image, categoryId } = createProductDto;
    const imageUrl = saveImage(image);

    const product = new Product();
    product.name = name;
    product.price = price;
    product.description = description;
    product.image = imageUrl;
    product.categoryId = categoryId;

    return await this.productRepository.save(product);
  }

  async findAll(): Promise<Product[]> {
    const products = await this.productRepository.find({ relations: ['category'] });

    products.forEach(product => {
      if (product.category) {
        product['category_name'] = product.category.name;
        delete product.category;
      }
    });
    return products;
  }

  async findOne(id: string): Promise<Product> {
    return this.productRepository.findOne({ where: { id }, relations: ['category'] });
  }
}
