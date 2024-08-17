import { IsNotEmpty, IsNumber, IsString, IsUUID } from 'class-validator';

export class CreateExpenseItemDto {
  @IsNumber()
  @IsNotEmpty()
  quantity: number;

  @IsNumber()
  @IsNotEmpty()
  price: number;

  @IsUUID()
  @IsNotEmpty()
  productId: string;
}
