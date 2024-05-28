import { Test, TestingModule } from '@nestjs/testing';
import { ExpenseItemsController } from './expense_items.controller';
import { ExpenseItemsService } from './expense_items.service';

describe('ExpenseItemsController', () => {
  let controller: ExpenseItemsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExpenseItemsController],
      providers: [ExpenseItemsService],
    }).compile();

    controller = module.get<ExpenseItemsController>(ExpenseItemsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
