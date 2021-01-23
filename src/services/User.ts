import { UserResponse, Errors } from "../types/UserResponse";
import { Connection } from "typeorm";
import { User } from "../domain/entities/User";
import {
  init as InitDB,
  Repository,
  // DeleteResult,
} from "../driver/database/postgres";
import argon2 from "argon2";
import { validate, validateOrReject, ValidationError } from "class-validator";

export class UserService {
  private userRepository: Repository<User>;

  constructor(userRepository: Connection) {
    this.userRepository = userRepository.getRepository(User);
  }

  public findById = async ({ userId }: { userId: number }): Promise<User | undefined> => {
    return this.userRepository.findOne({
      where: {
        id: userId
      }
    })  
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
}

export const init = () => {
  const userRepository = InitDB();
  return new UserService(userRepository);
};

export default init;
