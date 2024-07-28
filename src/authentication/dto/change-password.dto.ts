import { IsNotEmpty } from 'class-validator';

export class ChangePasswordDto {
  @IsNotEmpty()
  readonly old_password: string;

  @IsNotEmpty()
  readonly new_password: string;

  @IsNotEmpty()
  readonly confirm_new_password: string;
}
