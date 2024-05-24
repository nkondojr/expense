import { Controller, Get, Post, Body, Patch, Param, Delete, NotFoundException, UseGuards, Put } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { JwtAuthGuard } from 'src/authentication/guards/jwt-auth.guard';

@Controller('api')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('users')
  async getAllUsers(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @Get('user/:id')
  async findOne(@Param('id') id: string) {
    const user = await this.usersService.findOne(id);
    return user;
  }

}
