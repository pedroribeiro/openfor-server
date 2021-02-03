import { UserResponse, Errors } from "../types/UserResponse";
import { Connection, UpdateResult } from "typeorm";
import { User } from "../domain/entities/User";
import {
  init as InitDB,
  Repository,
  // DeleteResult,
} from "../driver/database/postgres";
import argon2 from "argon2";
import { v4 } from "uuid";
import { validate } from "class-validator";
import { Redis } from "ioredis";
import { passwordChangeEmail } from "../driver/notifier/nodemailer";

export class UserService {
  private userRepository: Repository<User>;

  constructor(userRepository: Connection) {
    this.userRepository = userRepository.getRepository(User);
  }

  public findById = async ({
    userId,
  }: {
    userId: number;
  }): Promise<User | undefined> => {
    return this.userRepository.findOne({
      where: {
        id: userId,
      },
    });
  };

  public findByEmail = async ({
    email,
  }: {
    email: string;
  }): Promise<User | undefined> => {
    return this.userRepository.findOne({
      where: {
        email: email,
      },
    });
  };

  public forgotPassword = async ({
    email,
    redis,
  }: {
    email: string;
    redis: Redis;
  }): Promise<Boolean> => {
    const user = await this.findByEmail({
      email,
    });

    if (!user) {
      return true;
    }

    const token = v4();

    await redis.set(token, user.id, "ex", 1000 * 60 * 60 * 24);

    await passwordChangeEmail({ to: user.email, token });

    return true;
  };

  public register = async ({
    userName,
    email,
    password,
  }: {
    userName: string;
    email: string;
    password: string;
  }): Promise<UserResponse> => {
    const errors = await this.validateFields({ userName, password, email });

    if (errors.length > 0) {
      return { errors };
    }
    let user;
    try {
      const hash = await argon2.hash(password);
      user = await this.userRepository.save({
        userName,
        email,
        password: hash,
      });
    } catch (error) {
      if (error.code === "23505" && error.detail.includes("userName")) {
        return {
          errors: [{ field: "userName", message: "username already taken" }],
        };
      } else if (error.code === "23505" && error.detail.includes("email")) {
        return {
          errors: [{ field: "email", message: "email already in use" }],
        };
      }
    }
    return { user };
  };

  public login = async ({
    email,
    password,
  }: {
    email: string;
    password: string;
  }): Promise<UserResponse> => {
    const user = await this.userRepository.findOne({
      where: {
        email: email,
      },
    });
    if (!user) {
      return {
        errors: [
          {
            field: "email",
            message: "user email not found",
          },
        ],
      };
    }
    const validate = await argon2.verify(user.password, password);
    if (!validate) {
      return {
        errors: [
          {
            field: "password",
            message: "invalid password",
          },
        ],
      };
    }
    return { user };
  };

  private validateFields = async ({
    userName,
    password,
    email,
  }: {
    userName: string;
    password: string;
    email: string;
  }): Promise<Errors[]> => {
    let user = new User();
    user.userName = userName;
    user.email = email;
    user.password = password;

    const validadeReturn = await validate(user);

    const errors = validadeReturn.map((err) => {
      const { property, constraints } = err;
      return {
        field: property,
        message: Object.entries(constraints!)[0][1],
      };
    });

    return errors;
  };

  public updatePassword = async (
    redis: Redis,
    {
      token,
      newPassword,
    }: {
      token: string;
      newPassword: string;
    }
  ): Promise<UserResponse> => {
    if (newPassword.length < 6) {
      return {
        errors: [
          {
            field: "password",
            message: "password length must be greater than 6",
          },
        ],
      };
    }

    const userId = await redis.get(token);
    if (!userId) {
      return {
        errors: [
          {
            field: "password",
            message: "password change token expired",
          },
        ],
      };
    }
    const userIdparsed = parseInt(userId);
    const user = await this.findById({ userId: userIdparsed });

    if (!user) {
      return {
        errors: [
          {
            field: "password",
            message: "user not find",
          },
        ],
      };
    }

    await this.userRepository.update(
      {
        id: user.id,
      },
      {
        password: await argon2.hash(newPassword),
      }
    );
    await redis.del(token);
    return { user };
  };
}

export const init = () => {
  const userRepository = InitDB();
  return new UserService(userRepository);
};

export default init;
