import { IsDecimal, IsNotEmpty, IsOptional, IsString, IsUUID } from "class-validator";

export class CreateProductDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsDecimal()
    @IsNotEmpty()
    price: number;

    @IsString()
    @IsNotEmpty()
    description: string;

    @IsString()
    @IsOptional()
    image: string;

    @IsString()
    @IsNotEmpty()
    @IsUUID()
    categoryId: string;
}
