import { CreateUserUseCase } from "./CreateUserUseCase";
import { InMemoryUsersRepository } from '../../repositories/in-memory/InMemoryUsersRepository';
import { User } from "@modules/users/entities/User";
import { CreateUserError } from "./CreateUserError";

let createUserUseCase: CreateUserUseCase;
let usersRepositoryInMemory: InMemoryUsersRepository;

describe("Create User", () => {
  beforeEach(() => {
    usersRepositoryInMemory = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory);
  });

  it("should be able to create a new user", async () => {
    const user = await createUserUseCase.execute({
      name: "Test user",
      email: "user@test.com",
      password: "1234"
    });

    expect(user).toBeInstanceOf(User);
    expect(user).toHaveProperty("id");
  });

  it("should not be able to create a new user if user already exists", async () => {
    expect(async () => {
      await createUserUseCase.execute({
        name: "Test user",
        email: "user@test.com",
        password: "1234"
      });

      await createUserUseCase.execute({
        name: "Test user",
        email: "user@test.com",
        password: "1234"
      });
    }).rejects.toBeInstanceOf(CreateUserError);
  });
});
