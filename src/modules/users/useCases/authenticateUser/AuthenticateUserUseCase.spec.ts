import { InMemoryUsersRepository } from "@modules/users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";
import { ICreateUserDTO } from '../createUser/ICreateUserDTO';
import { IncorrectEmailOrPasswordError } from "./IncorrectEmailOrPasswordError";

let createUserUseCase: CreateUserUseCase;
let usersRepositoryInMemory: InMemoryUsersRepository;
let authenticateUserUseCase: AuthenticateUserUseCase;

describe("Authenticate User", () => {
  beforeEach(() => {
    usersRepositoryInMemory = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory);
    authenticateUserUseCase = new AuthenticateUserUseCase(usersRepositoryInMemory);
  });

  it("should be able authenticate user", async () => {
    const payloadCreateUser: ICreateUserDTO = {
      name: "Test user",
      email: "user@test.com",
      password: "1234"
    };

    await createUserUseCase.execute(payloadCreateUser);

    const auth = await authenticateUserUseCase.execute(payloadCreateUser);

    expect(auth).toHaveProperty("token");
  });

  it("should be able authenticate user with email invalid", () => {
    expect(async () => {
      const payloadCreateUser: ICreateUserDTO = {
        name: "Test user",
        email: "user@test.com",
        password: "1234"
      };

      await createUserUseCase.execute(payloadCreateUser);

      Object.assign(payloadCreateUser, { email: "user@test.com.br" });

      await authenticateUserUseCase.execute(payloadCreateUser);
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });

  it("should be able authenticate user with password invalid", () => {
    expect(async () => {
      const payloadCreateUser: ICreateUserDTO = {
        name: "Test user",
        email: "user@test.com",
        password: "1234"
      };

      await createUserUseCase.execute(payloadCreateUser);

      Object.assign(payloadCreateUser, { password: "12345" });

      await authenticateUserUseCase.execute(payloadCreateUser);
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });
});
