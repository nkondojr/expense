import { IsNotEmpty, IsEmail, IsString, MinLength, IsInt, Length } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  fullname: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  @Length(9, 13, { message: 'Mobile number must be between 9 and 13 digits' })
  mobile: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}