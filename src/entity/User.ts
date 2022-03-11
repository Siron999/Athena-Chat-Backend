import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";
import {
  validate,
  IsEmail,
  IsInt,
  IsString,
  IsNotEmpty,
  ValidationError,
} from "class-validator";

@Entity()
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @IsNotEmpty({ message: "Field Required" })
  @IsString({ message: "Invalid Username" })
  @Column()
  username: string;

  @IsNotEmpty({ message: "Field Required" })
  @IsEmail({ message: "Invalid Email" })
  @Column()
  email: string;

  @IsNotEmpty({ message: "Field Required" })
  @IsString({ message: "Invalid Name" })
  @Column()
  fullName: string;

  @IsNotEmpty({ message: "Field Required" })
  @IsInt({ message: "Invalid Mobile Number" })
  @Column()
  mobileNumber: number;

  @IsNotEmpty({ message: "Field Required" })
  @IsString({ message: "Invalid Password" })
  @Column()
  password: string;

  async isValid(): Promise<ValidationError[] | true> {
    const errors = await validate(this);

    if (errors.length > 0) {
      return errors;
    }
    return true;
  }
}
