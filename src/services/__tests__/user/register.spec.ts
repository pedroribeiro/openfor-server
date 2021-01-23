import { Connection, Repository } from "typeorm";
import { UserService } from "../../User";

jest.mock("../../../driver/database/postgres");

const repository = new Repository();

const userRepository = ({
  getRepository: () => repository,
} as unknown) as Connection;

describe("register method", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return a valid user", async () => {
    const userName = "user";
    const email = "user@user.com";
    const id = 1;
    const password = "password";

    const expectedUser = {
      userName,
      email,
      id,
    };

    repository.save = jest.fn().mockResolvedValueOnce(expectedUser);

    const userService = new UserService(userRepository);

    expect(
      await userService.register({ userName, email, password})
    ).toStrictEqual({
      user: {
        userName,
        email,
        id,
      },
    });
  });
});
