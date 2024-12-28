import { IsString, IsEnum, IsNotEmpty, Length } from 'class-validator';
import { AccountType } from '../../entities/class.entity';
import { Mode } from 'src/accounts/entities/group.entity';

export class CreateGroupDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  readonly name: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 50)
  readonly code: string;

  @IsEnum(AccountType)
  @IsNotEmpty()
  readonly type: AccountType;

  @IsEnum(Mode)
  @IsNotEmpty()
  readonly mode: Mode;
}
