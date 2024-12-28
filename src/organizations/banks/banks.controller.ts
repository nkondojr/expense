import {
  Controller,
  Get,
  Param,
  Body,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { GetUser } from 'src/authentication/decorators/get-user.decorator';
import { User } from 'src/users/entities/user.entity';
import { JwtAuthGuard } from 'src/authentication/guards/jwt-auth.guard';
import { UpdateBankDto } from '../dto/banks/update-bank.dto';
import { Bank } from '../entities/banks/bank.entity';
import { BanksService } from './banks.service';

@Controller('organizations/banks')
@UseGuards(JwtAuthGuard)
export class BanksController {
  constructor(private readonly banksService: BanksService) {}

  @Get(':uuid')
  async getBank(@Param('uuid') uuid: string): Promise<Bank> {
    return this.banksService.findOne(uuid);
  }

  @Patch(':uuid')
  async update(
    @Param('uuid') uuid: string,
    @Body() updateBankDto: UpdateBankDto,
    @GetUser() user: User,
  ): Promise<{ message: string }> {
    return this.banksService.update(uuid, updateBankDto, user);
  }

  @Patch(':uuid/activate-deactivate')
  async toggleBankStatus(
    @Param('uuid') uuid: string,
  ): Promise<{ message: string }> {
    return this.banksService.toggleBankStatus(uuid);
  }
}
