import { IsString, Length } from 'class-validator';

export class CreateBankDto {
  @IsString({ message: 'Bank name must be a string.' })
  @Length(1, 50, {
    message: 'Bank name must be between 1 and 50 characters.',
  })
  bankName: string;

  @IsString({ message: 'accountName must be a string.' })
  @Length(1, 100, {
    message: 'accountName must be between 1 and 100 characters.',
  })
  accountName: string;

  @IsString({ message: 'accountNumber must be a string.' })
  @Length(1, 17, {
    message: 'accountNumber must be between 1 and 17 characters.',
  })
  accountNumber: string;

  @IsString({ message: 'accountBranch must be a string.' })
  @Length(1, 50, {
    message: 'accountBranch must be between 1 and 50 characters.',
  })
  accountBranch: string;
}
