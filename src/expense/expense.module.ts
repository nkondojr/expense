import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExpenseService } from './expense.service';
import { ExpenseController } from './expense.controller';
import { Expense } from './entities/expense.entity';
import { ExpenseItem } from 'src/expense_items/entities/expense_item.entity';
import { Product } from 'src/products/entities/product.entity';
import { AuthenticationModule } from 'src/authentication/authentication.module';
import { MessagingService } from 'utils/messaging.service';
import { Organization } from 'src/organizations/entities/organization.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Expense, ExpenseItem, Product, Organization]),
    forwardRef(() => AuthenticationModule), // Import AuthenticationModule
  ],
  providers: [ExpenseService, MessagingService],
  controllers: [ExpenseController],
})
export class ExpenseModule {}
