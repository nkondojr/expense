import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { isUUID } from 'class-validator';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  // ***********************************************************************************************************************************************
  async create(createUserDto: CreateUserDto): Promise<{ message: string }> {
    const { username, email, mobile, password, confirm_password, is_active } =
      createUserDto;
    // Validate passwords
    if (password !== confirm_password) {
      throw new BadRequestException('Passwords do not match');
    }
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User();
    user.username = username;
    user.email = email;
    user.mobile = mobile;
    user.is_active = is_active;
    user.password = hashedPassword;

    try {
      await this.usersRepository.save(user);
      return {
        message: 'User created successfully',
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
  async findByEmail(email: string): Promise<User> {
    return this.usersRepository.findOne({ where: { email } });
  }

  // ***********************************************************************************************************************************************
  async getUserProfile(id: string): Promise<Partial<User> | undefined> {
    const user = await this.usersRepository.findOne({ where: { id } });
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  // ***********************************************************************************************************************************************
  async findAll(
    searchTerm?: string,
    page: number = 1,
    pageSize: number = 10,
  ): Promise<any> {
    const query = this.usersRepository
      .createQueryBuilder('user')
      .select([
        'user.id',
        'user.username',
        'user.email',
        'user.mobile',
        'user.is_active',
        'user.created_at',
        'user.updated_at',
      ]);

    if (searchTerm) {
      query.where(
        'user.username ILIKE :searchTerm OR user.email ILIKE :searchTerm OR user.mobile ILIKE :searchTerm',
        { searchTerm: `%${searchTerm}%` },
      );
    }

    query.skip((page - 1) * pageSize).take(pageSize);

    const [data, total] = await query.getManyAndCount();
    const lastPage = Math.ceil(total / pageSize);

    return {
      links: {
        next:
          page < lastPage
            ? `/users?page=${page + 1}&pageSize=${pageSize}`
            : null,
        previous:
          page > 1 ? `/users?page=${page - 1}&pageSize=${pageSize}` : null,
      },
      count: total,
      lastPage: lastPage,
      currentPage: page,
      data: data,
    };
  }

  // ***********************************************************************************************************************************************
  async findOne(id: string): Promise<Partial<User> | undefined> {
    // Validate the ID format
    if (!isUUID(id)) {
      throw new BadRequestException('Invalid ID format');
    }

    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  // ***********************************************************************************************************************************************
  async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<{ message: string; user: Partial<User> }> {
    if (!isUUID(id)) {
      throw new BadRequestException('Invalid ID format');
    }

    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    if (updateUserDto.password) {
      const salt = await bcrypt.genSalt();
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, salt);
    }

    try {
      await this.usersRepository.update(id, updateUserDto);
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException(
          'Duplicate value violates unique constraint',
        );
      } else {
        throw error;
      }
    }

    const updatedUser = await this.usersRepository.findOne({ where: { id } });
    const { password, ...userWithoutPassword } = updatedUser;

    return {
      message: 'User updated successfully',
      user: userWithoutPassword,
    };
  }

  // // ***********************************************************************************************************************************************
  // async remove(id: string): Promise<void> {
  //   if (!isUUID(id)) {
  //     throw new BadRequestException('Invalid ID format');
  //   }

  //   const user = await this.usersRepository.findOne({ where: { id } });
  //   if (!user) {
  //     throw new NotFoundException(`User with ID ${id} not found`);
  //   }

  //   await this.usersRepository.delete(id);
  // }
  // ***********************************************************************************************************************************************
  async toggleUserStatus(id: string): Promise<{ message: string }> {
    // Validate the UUID format
    if (!isUUID(id)) {
      throw new BadRequestException('Invalid UUID format');
    }

    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Toggle the is_active status
    user.is_active = !user.is_active;
    await this.usersRepository.save(user);

    const state = user.is_active ? 'activated' : 'deactivated';
    return { message: `User ${state} successfully` };
  }
}
