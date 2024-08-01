import { IsNotEmpty, IsEmail, IsString, MinLength, IsInt, Length, IsBoolean } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  full_name: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  @Length(9, 13, { message: 'Mobile number must be between 9 and 13 digits' })
  mobile: string;

  @IsString()
  @IsNotEmpty()
  @Length(4, 12)
  password: string;

  @IsString()
  @IsNotEmpty()
  @Length(4, 12)
  readonly confirm_password: string;

  @IsBoolean()
  is_active: boolean;
}