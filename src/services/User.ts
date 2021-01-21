import { UserResponse } from "../types/UserResponse";
import { Connection } from "typeorm";
import { User } from "../domain/entities/User";
import {
  init as InitDB,
  Repository,
  // DeleteResult,
} from "../driver/database/postgres";
import argon2 from "argon2";

export class UserService {
  private userRepository: Repository<User>;

  constructor(userRepository: Connection) {
    this.userRepository = userRepository.getRepository(User);
  }

  public register = async (
    userName: string,
    email: string,
    password: string
  ): Promise<UserResponse> => {
    const hash = await argon2.hash(password);
    let user;
    try {
      user = await this.userRepository.save({
        userName,
        email,
        password: hash,
      });
    } catch (error) {
      console.log("ERROR => ", error);
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
}

export const init = () => {
  const userRepository = InitDB();
  return new UserService(userRepository);
};

export default init;
