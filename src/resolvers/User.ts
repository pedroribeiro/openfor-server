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

  @Mutation(() => Boolean)
  async forgotPassword(
    @Arg("email") email: string,
    @Ctx() { redis, userService }: Context
  ) {
    return userService.forgotPassword({ redis, email });
  }

  @Mutation(() => UserResponse)
  async changePassword(
    @Arg("token") token: string,
    @Arg("newPassword") newPassword: string,
    @Ctx() { req, redis, userService }: Context
  ) {
    const { user, errors } = await userService.updatePassword(redis, {
      token,
      newPassword,
    });
    if (user) {
      req.session.userId = user.id;
    }
    return { user, errors };
  }
}

// [http://localhost:3000/change-password/0ab6ba87-2fa3-4c5d-84e7-757b12728368]
