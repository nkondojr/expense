import {
    IsNotEmpty,
    IsString,
    Length,
} from 'class-validator';

export class CreateNextOfKinDto {
    @IsNotEmpty()
    employeeId: string; // Reference to the Employee entity, sent as an ID

    @IsString()
    @IsNotEmpty()
    @Length(1, 200)
    name: string;

    @IsString()
    @IsNotEmpty()
    @Length(1, 50)
    relationShip: string;

    @IsString()
    @IsNotEmpty()
    @Length(1, 12)
    mobile: string;

    @IsString()
    @IsNotEmpty()
    @Length(1, 100)
    address: string;
}
