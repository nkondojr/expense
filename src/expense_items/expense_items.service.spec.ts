import { Test, TestingModule } from '@nestjs/testing';
import { ExpenseItemsService } from './expense_items.service';

describe('ExpenseItemsService', () => {
  let service: ExpenseItemsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ExpenseItemsService],
    }).compile();

    service = module.get<ExpenseItemsService>(ExpenseItemsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
