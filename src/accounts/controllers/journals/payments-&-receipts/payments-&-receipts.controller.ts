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
import { CreatePaymentAndReceiptDto } from 'src/accounts/dto/journals/payments-&-receipts/create-payment-&-receipt.dto';
import { PaymentsAndReceiptsService } from 'src/accounts/service/journals/payments-&-receipts/payments-&-receipts.service';
import { JwtAuthGuard } from 'src/authentication/guards/jwt-auth.guard';

@Controller('payments-and-receipts')
@UseGuards(JwtAuthGuard)
export class PaymentsAndReceiptsController {
  constructor(
    private readonly paymentsAndReceiptsService: PaymentsAndReceiptsService,
  ) {}

  // ***************************************************************************************************
  // Create a new receipts
  // ***************************************************************************************************
  @Post()
  async create(
    @Body() createPaymentAndReceiptDto: CreatePaymentAndReceiptDto,
  ): Promise<{ message: string }> {
    return this.paymentsAndReceiptsService.create(createPaymentAndReceiptDto);
  }

  // ***************************************************************************************************
  // Retrieve a specific receipt by its ID (UUID or other identifier)
  // ***************************************************************************************************
  @Get(':uuid')
  async findOne(@Param('uuid') uuid: string): Promise<any> {
    return this.paymentsAndReceiptsService.findOne(uuid);
  }

  // ***************************************************************************************************
  // Approve a payment (if applicable)
  // ***************************************************************************************************
  @Patch(':uuid/approve')
  async approvePayment(
    @Param('uuid') uuid: string,
    @Body() payload: ApproveOrderDto,
  ) {
    return await this.paymentsAndReceiptsService.approvePayment(uuid, payload);
  }
}
