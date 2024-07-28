import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExpenseItem } from './entities/expense_item.entity';
import { ExpenseItemsService } from './expense_items.service';
import { ExpenseItemsController } from './expense_items.controller';
import { AuthenticationModule } from 'src/authentication/authentication.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ExpenseItem]),
    forwardRef(() => AuthenticationModule), // Import AuthenticationModule
  ],
  providers: [ExpenseItemsService],
  controllers: [ExpenseItemsController],
  exports: [TypeOrmModule],  // Export the TypeOrmModule to use it in other modules
})
export class ExpenseItemsModule {}
