import { Context } from "./../types/Context";
import { Arg, Ctx, Mutation, Query, Resolver } from "type-graphql";
import { User } from "../domain/entities/User";
import { UserResponse } from "../types/UserResponse";

@Resolver(User)
export class UserResolver {
  @Query(() => String)
  async me() {
    return "me";
  }

  @Mutation(() => UserResponse)
  async register(
    @Arg("userName") userName: string,
    @Arg("email") email: string,
    @Arg("password") password: string,
    @Ctx() { userService }: Context
  ) {
    return userService.register(userName, email, password);
  }
}
