import { IsEmail, MinLength } from "class-validator";
import { Field, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity()
@ObjectType()
export class User extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn()
  id!: number;

  @Field()
  @Column({ unique: true })
  userName!: string;

  @Field()
  @Column({ unique: true })
  @IsEmail({},{
    message: 'Invalid email'
  })
  email!: string;

  @Column()
  @MinLength(6, {
    message: 'Password length must be greater than 6 characters'
  })
  password!: string;

  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date;
}
