import { IsNotEmpty } from "class-validator";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./User";

@Entity()
export class ConfirmationToken {
  constructor(token: string, createdAt: Date, user: User) {
    this.token = token;
    this.createdAt = createdAt;
    this.user = user;
  }

  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  @IsNotEmpty({ message: "Field Required" })
  token: string;

  @Column()
  @IsNotEmpty({ message: "Field Required" })
  createdAt: Date;

  @Column()
  confirmed: boolean = false;

  @Column()
  userId: string;

  @ManyToOne(() => User, { cascade: true, onDelete: "CASCADE" })
  user: User;
}
