import { Connection, Repository } from "typeorm";
import { UserService } from "../../User";

jest.mock("../../../driver/database/postgres");

const repository = new Repository();

const userRepository = {
  getRepository: () => repository,
};

describe("register method", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return a valid user", async () => {
    const userName = "user";
    const email = "user@user";
    const id = 1;

    const expectedUser = {
      userName,
      email,
      id,
    };

    repository.save = jest.fn().mockResolvedValueOnce(expectedUser);

    const userService = new UserService(
      (userRepository as unknown) as Connection
    );

    expect(
      await userService.register(userName, email, "password")
    ).toStrictEqual({
      user: {
        userName,
        email,
        id,
      },
    });
  });
});
