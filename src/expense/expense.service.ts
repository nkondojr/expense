import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { Expense } from './entities/expense.entity';
import { ExpenseItem } from 'src/expense_items/entities/expense_item.entity';
import { saveImage } from 'utils/image.utils';
import { isUUID } from 'class-validator';
import { Product } from 'src/products/entities/product.entity';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { MessagingService } from 'utils/messaging.service';
import { Organization } from 'src/organizations/entities/organization.entity';

@Injectable()
export class ExpenseService {
  constructor(
    @InjectRepository(Expense)
    private expenseRepository: Repository<Expense>,

    @InjectRepository(ExpenseItem)
    private expenseItemsRepository: Repository<ExpenseItem>,

    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(Organization)
    private organizationRepository: Repository<Organization>,

    private readonly messagingService: MessagingService, // Add MessagingService here

  ) { }

  // ***********************************************************************************************************************************************
  async create(
    createExpenseDto: CreateExpenseDto,
  ): Promise<{ message: string }> {
    const { date, amount, description, attachment, expenseItems } =
      createExpenseDto;

    if (!expenseItems || expenseItems.length === 0) {
      throw new BadRequestException('Expense items cannot be empty');
    }

    const invalidUUIDs = expenseItems.filter((item) => !isUUID(item.productId));
    if (invalidUUIDs.length > 0) {
      throw new UnprocessableEntityException(
        `Invalid ID format for product IDs: ${invalidUUIDs.map((item) => item.productId).join(', ')}`,
      );
    }

    // Validate product existence for each expense item
    for (const item of expenseItems) {
      const product = await this.productRepository.findOne({
        where: { id: item.productId },
      });
      if (!product) {
        throw new NotFoundException(
          `Product with id ${item.productId} not found`,
        );
      }
    }

    // Handle the attachment
    const imageUrl = attachment ? saveImage(attachment) : null;

    const expense = this.expenseRepository.create({
      date,
      amount,
      description,
      attachment: imageUrl,
    });

    try {
      // Save the expense
      const savedExpense = await this.expenseRepository.save(expense);

      // Create expense items
      const expenseItemsEntities = expenseItems.map((item) => {
        const expenseItem = new ExpenseItem();
        expenseItem.quantity = item.quantity;
        expenseItem.price = item.price;
        expenseItem.expense = savedExpense;
        expenseItem.product = { id: item.productId } as any; // Assuming product entity is referenced by ID
        return expenseItem;
      });

      // Save expense items
      await this.expenseItemsRepository.save(expenseItemsEntities);

      const organization = await this.organizationRepository.find();
      const organizationName = organization.length > 0 ? organization[0].name : 'Unknown Organization';


      // Determine the greeting based on the time of day
      const currentHour = new Date().getHours();
      let greeting = 'Good morning';
      if (currentHour >= 12 && currentHour < 17) {
        greeting = 'Good afternoon';
      } else if (currentHour >= 17) {
        greeting = 'Good evening';
      }

      // Format the amount with comma separators
      const formattedAmount = new Intl.NumberFormat('en-TZ', {
        style: 'currency',
        currency: 'TZS',
      }).format(amount);

      // Send SMS after transaction
      try {
      const smsContent = `${greeting},
  
This is to inform you that a purchase has been made at ${organizationName}. The total expense amount is ${formattedAmount}.
  
For further details, please refer to the link: https://expense.ecu.co.tz/.`;

        await this.messagingService.sendSms('255789370787', smsContent);
      } catch (smsError) {
        console.error('Error sending SMS:', smsError.response?.data || smsError.text);
      }

      return {
        message: 'Expense created successfully',
      };
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException('Expense already exists');
      } else {
        throw error;
      }
    }
  }


  // ***********************************************************************************************************************************************
  async findAll(
    searchTerm?: string,
    page: number = 1,
    pageSize: number = 5,
  ): Promise<any> {
    const query = this.expenseRepository
      .createQueryBuilder('expense')
      .select([
        'expense.id',
        'expense.date',
        'expense.amount',
        'expense.description',
        'expense.attachment',
        'expense.created_at',
        'expense.updated_at',
      ]);

    if (searchTerm) {
      query
        .where('expense.description ILIKE :searchTerm', {
          searchTerm: `%${searchTerm}%`,
        })
        .orWhere("TO_CHAR(expense.date, 'DD-MM-YYYY') ILIKE :searchTerm", {
          searchTerm: `%${searchTerm}%`,
        })
        .orWhere('CAST(expense.amount AS TEXT) ILIKE :searchTerm', {
          searchTerm: `%${searchTerm}%`,
        });
    }

    query.skip((page - 1) * pageSize).take(pageSize);

    const [expenses, total] = await query.getManyAndCount();
    const lastPage = Math.ceil(total / pageSize);

    const result = expenses.map((expense) => ({
      id: expense.id,
      date: expense.date,
      amount: expense.amount,
      description: expense.description,
      attachment: expense.attachment,
      created_at: expense.created_at,
      updated_at: expense.updated_at,
    }));

    return {
      links: {
        next:
          page < lastPage
            ? `/expense?page=${page + 1}&pageSize=${pageSize}`
            : null,
        previous:
          page > 1 ? `/expense?page=${page - 1}&pageSize=${pageSize}` : null,
      },
      count: total,
      lastPage: lastPage,
      currentPage: page,
      data: result,
    };
  }

  // ***********************************************************************************************************************************************
  async findOne(id: string): Promise<any> {
    // Validate the ID format
    if (!isUUID(id)) {
      throw new BadRequestException('Invalid ID format');
    }

    const expense = await this.expenseRepository.findOne({
      where: { id },
      relations: [
        'expenseItems',
        'expenseItems.product',
        'expenseItems.product.category',
      ],
    });

    if (!expense) {
      throw new NotFoundException(`Expense with ID ${id} not found`);
    }

    // Transform the expense object
    const result = {
      id: expense.id,
      date: expense.date,
      amount: expense.amount,
      description: expense.description,
      attachment: expense.attachment,
      created_at: expense.created_at,
      updated_at: expense.updated_at,
      expenseItems: expense.expenseItems.map((item) => ({
        id: item.id,
        quantity: item.quantity,
        price: item.price,
        productId: item.product.id,
        productName: item.product.name,
        productUnit: item.product.unit,
        categoryName: item.product.category.name,
      })),
    };

    return result;
  }

  // ***********************************************************************************************************************************************
  async update(
    id: string,
    updateExpenseDto: UpdateExpenseDto,
  ): Promise<{ message: string }> {
    const { date, amount, description, attachment, expenseItems } =
      updateExpenseDto;

    // Find the existing expense
    const expense = await this.expenseRepository.findOne({ where: { id } });
    if (!expense) {
      throw new NotFoundException(`Expense with id ${id} not found`);
    }

    // Validate expense items if provided
    if (expenseItems && expenseItems.length > 0) {
      const invalidUUIDs = expenseItems.filter(
        (item) => !isUUID(item.productId),
      );
      if (invalidUUIDs.length > 0) {
        throw new UnprocessableEntityException(
          `Invalid ID format for product IDs: ${invalidUUIDs.map((item) => item.productId).join(', ')}`,
        );
      }

      // Validate product existence for each expense item
      for (const item of expenseItems) {
        const product = await this.productRepository.findOne({
          where: { id: item.productId },
        });
        if (!product) {
          throw new NotFoundException(
            `Product with id ${item.productId} not found`,
          );
        }
      }
    }

    // Handle the attachment if provided
    const imageUrl = attachment ? saveImage(attachment) : expense.attachment;

    // Update expense fields
    expense.date = date ?? expense.date;
    expense.amount = amount ?? expense.amount;
    expense.description = description ?? expense.description;
    expense.attachment = imageUrl;

    try {
      // Save updated expense
      await this.expenseRepository.save(expense);

      // Update expense items if provided
      if (expenseItems && expenseItems.length > 0) {
        // Delete existing expense items
        await this.expenseItemsRepository.delete({
          expense: { id: expense.id },
        });

        // Create and save new expense items
        const expenseItemsEntities = expenseItems.map((item) => {
          const expenseItem = new ExpenseItem();
          expenseItem.quantity = item.quantity;
          expenseItem.price = item.price;
          expenseItem.expense = expense;
          expenseItem.product = { id: item.productId } as any; // Assuming product entity is referenced by ID
          return expenseItem;
        });
        await this.expenseItemsRepository.save(expenseItemsEntities);
      }

      return {
        message: 'Expense updated successfully',
      };
    } catch (error) {
      throw error;
    }
  }

  // ***********************************************************************************************************************************************
  async remove(id: string): Promise<{ message: string }> {
    // Validate the ID format
    if (!isUUID(id)) {
      throw new BadRequestException('Invalid ID format');
    }

    const expense = await this.expenseRepository.findOne({ where: { id } });
    if (!expense) {
      throw new NotFoundException(`Expense with ID ${id} not found`);
    }

    await this.expenseItemsRepository.delete({ expense: { id } });
    await this.expenseRepository.delete(id);
    return {
      message: 'Expense deleted successfully',
    };
  }
}
