import { User } from "../domain/entities/User";
import { Field, ObjectType } from "type-graphql";

@ObjectType()
export class Errors {
  @Field()
  field?: string;
  @Field()
  message?: string;
}

@ObjectType()
export class UserResponse {
  @Field(() => [Errors], { nullable: true })
  errors?: Errors[];
  @Field(() => User, { nullable: true })
  user?: User;
}
