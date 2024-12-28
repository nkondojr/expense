import {
  Controller,
  Get,
  Param,
  Body,
  Post,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { ApproveOrderDto } from 'src/accounts/dto/budgets/approve-purchase-order.dto';
import { CreateJournalEntryDto } from 'src/accounts/dto/journals/journal-entries/create-journal-entry.dto';
import { JournalEntriesService } from 'src/accounts/service/journals/journal-entries/journal-entries.service';
import { JwtAuthGuard } from 'src/authentication/guards/jwt-auth.guard';

@Controller('journal-entries')
@UseGuards(JwtAuthGuard)
export class JournalEntriesController {
  constructor(private readonly journalEntiesService: JournalEntriesService) {}

  // ***************************************************************************************************
  // Create a new receipts
  // ***************************************************************************************************
  @Post()
  async create(
    @Body() createJournalEntryDto: CreateJournalEntryDto,
  ): Promise<{ message: string }> {
    return this.journalEntiesService.create(createJournalEntryDto);
  }

  // ***************************************************************************************************
  // Retrieve a specific receipt by its ID (UUID or other identifier)
  // ***************************************************************************************************
  @Get(':uuid')
  async findOne(@Param('uuid') uuid: string): Promise<any> {
    return this.journalEntiesService.findOne(uuid);
  }

  // ***************************************************************************************************
  // Approve a payment (if applicable)
  // ***************************************************************************************************
  @Patch(':uuid/approve')
  async approvePayment(
    @Param('uuid') uuid: string,
    @Body() payload: ApproveOrderDto,
  ) {
    return await this.journalEntiesService.approveJournal(uuid, payload);
  }
}
