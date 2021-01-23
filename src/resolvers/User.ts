import { UserResponse } from "./../types/UserResponse";
import { Context } from "./../types/Context";
import { Arg, Ctx, Mutation, Query, Resolver } from "type-graphql";
import { User } from "../domain/entities/User";

@Resolver(User)
export class UserResolver {
  @Query(() => UserResponse)
  async logged(@Ctx() { req, userService }: Context) {
    console.log("res", req.session.userId)
    if (!req.session.userId) {
      return { user: null};
    }
    const {
      session: { userId },
    } = req;
    console.log("userId", userId);
    
    const user = userService.findById({ userId });
    return { user };
  }

  @Mutation(() => UserResponse)
  async register(
    @Arg("userName") userName: string,
    @Arg("email") email: string,
    @Arg("password") password: string,
    @Ctx() { userService }: Context
  ) {
    return userService.register({ userName, email, password });
  }
  @Mutation(() => UserResponse)
  async login(
    @Arg("email") email: string,
    @Arg("password") password: string,
    @Ctx() { userService, req }: Context
  ) {
    const { user, errors } = await userService.login({ email, password });
    if (user) {
      req.session.userId = user.id;
    }
    return { user, errors };
  }
}
