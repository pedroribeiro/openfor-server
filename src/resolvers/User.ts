import { UserResponse } from "./../types/UserResponse";
import { Context } from "./../types/Context";
import { Arg, Ctx, Mutation, Query, Resolver } from "type-graphql";
import { User } from "../domain/entities/User";

@Resolver(User)
export class UserResolver {
  @Query(() => UserResponse)
  async logged(@Ctx() { req, userService }: Context) {
    if (!req.session.userId) {
      return { user: null };
    }

    const {
      session: { userId },
    } = req;

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

  @Mutation(() => Boolean)
  async logout(@Ctx() { req, res }: Context) {
    return new Promise((resolve) => {
      req.session.destroy((error: any) => {
        res.clearCookie(process.env.COOKIE_NAME!);
        if (error) {
          console.log(error);
          resolve(false);
          return;
        }
        resolve(true);
      });
    });
  }
}
