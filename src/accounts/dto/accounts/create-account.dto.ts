import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  Length,
  IsOptional,
  IsNumber,
  ValidateIf,
  IsDecimal,
  IsEnum,
  ValidateNested,
} from 'class-validator';
import { Mode } from 'src/accounts/entities/group.entity';
import { CreateBankDto } from 'src/organizations/dto/banks/create-bank.dto';

export class CreateAccountDto {
  @IsNotEmpty()
  @Length(1, 100)
  name: string;

  @IsNotEmpty()
  @Length(1, 80)
  code: string;

  @IsOptional()
  @IsDecimal({ decimal_digits: '0,4' })
  balance: string;

  @ValidateIf((data) => data.groupId !== undefined)
  @IsNumber()
  groupId: number;

  @ValidateIf((data) => data.classId !== undefined)
  @IsNumber()
  classId: number;

  @ValidateIf((data) => data.multiCurrencyId !== undefined)
  @IsNumber()
  multiCurrencyId: number;

  @IsEnum(Mode)
  @IsNotEmpty()
  readonly mode: Mode;

  @IsOptional()
  @ValidateNested()
  @Type(() => CreateBankDto)
  bankDetails?: CreateBankDto;
}
