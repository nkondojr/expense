import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { isUUID } from 'class-validator';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) { }

  // ***********************************************************************************************************************************************
  async create(createUserDto: CreateUserDto): Promise<{ message: string }> {
    const { full_name, email, mobile, password } = createUserDto;
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User();
    user.full_name = full_name;
    user.email = email;
    user.mobile = mobile;
    user.password = hashedPassword;

    try {
      await this.userRepository.save(user);
      return {
        message: 'User registered successfully',
      };
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException('User already exists');
      } else {
        throw error;
      }
    }
  }

  // ***********************************************************************************************************************************************
  async findByMobile(mobile: string): Promise<User> {
    return this.userRepository.findOne({ where: { mobile } });
  }

  // ***********************************************************************************************************************************************
  async getUserProfile(id: string): Promise<Partial<User> | undefined> {
    const user = await this.userRepository.findOne({ where: { id } });
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  // ***********************************************************************************************************************************************
  async findAll(searchTerm?: string, page: number = 1, pageSize: number = 10): Promise<any> {
    const query = this.userRepository.createQueryBuilder('user')
      .select(['user.id', 'user.full_name', 'user.email', 'user.mobile']);

    if (searchTerm) {
      query.where('user.full_name LIKE :searchTerm OR user.email LIKE :searchTerm', { searchTerm: `%${searchTerm}%` });
    }

    query.skip((page - 1) * pageSize).take(pageSize);

    const [data, total] = await query.getManyAndCount();
    const lastPage = Math.ceil(total / pageSize);

    return {
      links: {
        next: page < lastPage ? `/users?page=${page + 1}&pageSize=${pageSize}` : null,
        previous: page > 1 ? `/users?page=${page - 1}&pageSize=${pageSize}` : null
      },
      count: total,
      lastPage: lastPage,
      currentPage: page,
      data: data
    };
  }

  // ***********************************************************************************************************************************************
  async findOne(id: string): Promise<Partial<User> | undefined> {
    // Validate the ID format
    if (!isUUID(id)) {
      throw new BadRequestException('Invalid ID format');
    }

    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}
