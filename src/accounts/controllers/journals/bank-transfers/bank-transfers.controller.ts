import {
  Controller,
  Get,
  Param,
  Body,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApproveOrderDto } from 'src/accounts/dto/budgets/approve-purchase-order.dto';
import { CreateBankTransferDto } from 'src/accounts/dto/journals/bank-transfers/create-bank-transfer.dto';
import { BankTransfersService } from 'src/accounts/service/journals/bank-transfers/bank-transfers.service';
import { JwtAuthGuard } from 'src/authentication/guards/jwt-auth.guard';

@Controller('bank-transfers')
@UseGuards(JwtAuthGuard)
export class BankTransfersController {
  constructor(private readonly bankTransfersService: BankTransfersService) {}

  // ***************************************************************************************************
  // Create a new transfers
  // ***************************************************************************************************
  @Post()
  async create(
    @Body() createBankTransferDto: CreateBankTransferDto,
  ): Promise<{ message: string }> {
    return this.bankTransfersService.create(createBankTransferDto);
  }

  // ***************************************************************************************************
  // Retrieve a specific transfer by its ID (UUID or other identifier)
  // ***************************************************************************************************
  @Get(':uuid')
  async findOne(@Param('uuid') uuid: string): Promise<any> {
    return this.bankTransfersService.findOne(uuid);
  }

  // ***************************************************************************************************
  // Approve a transfer (if applicable)
  // ***************************************************************************************************
  @Patch(':uuid/approve')
  async approveTransfer(
    @Param('uuid') uuid: string,
    @Body() payload: ApproveOrderDto,
  ) {
    return await this.bankTransfersService.approveTransfer(uuid, payload);
  }
}
