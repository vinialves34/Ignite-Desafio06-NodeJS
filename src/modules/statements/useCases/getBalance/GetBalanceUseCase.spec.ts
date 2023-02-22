import { InMemoryStatementsRepository } from "@modules/statements/repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { InMemoryUsersRepository } from "@modules/users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "@modules/users/useCases/createUser/CreateUserUseCase";
import { Statement } from "@modules/statements/entities/Statement";
import { User } from "@modules/users/entities/User";
import { GetBalanceUseCase } from "./GetBalanceUseCase";
import { GetBalanceError } from "./GetBalanceError";

let createStatementUseCase: CreateStatementUseCase;
let getBalanceUseCase: GetBalanceUseCase;
let statementsRepositoryInMemory: InMemoryStatementsRepository;
let usersRepositoryInMemory: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let statementDeposit: Statement;
let statementWithdraw: Statement;

describe("Get Balance", () => {
  beforeEach(() => {
    statementDeposit = new Statement();
    statementWithdraw = new Statement();
    usersRepositoryInMemory = new InMemoryUsersRepository();
    statementsRepositoryInMemory = new InMemoryStatementsRepository();
    createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory);
    getBalanceUseCase = new GetBalanceUseCase(statementsRepositoryInMemory, usersRepositoryInMemory);
    createStatementUseCase = new CreateStatementUseCase(usersRepositoryInMemory, statementsRepositoryInMemory);
  });

  it("should be able make deposit and get balance", async () => {
    const depositValue = 100;

    const user: User = await createUserUseCase.execute({
      name: "Test user",
      email: "user@test.com",
      password: "1234"
    });

    Object.assign(statementDeposit, {
      user_id: user.id,
      type: "deposit",
      amount: depositValue,
      description: "Deposit in statement"
    });

    await createStatementUseCase.execute(statementDeposit);

    const statement = await getBalanceUseCase.execute({ user_id: user.id });

    expect(statement).toHaveProperty("balance");
    expect(statement.balance).toEqual(depositValue);
  });

  it("should be able make withdraw and get balance", async () => {
    const user: User = await createUserUseCase.execute({
      name: "Test user",
      email: "user@test.com",
      password: "1234"
    });

    Object.assign(statementDeposit, {
      user_id: user.id,
      type: "deposit",
      amount: 500,
      description: "Deposit in statement"
    });

    await createStatementUseCase.execute(statementDeposit);

    Object.assign(statementWithdraw, {
      user_id: user.id,
      type: "withdraw",
      amount: 150,
      description: "Withdraw in statement"
    });

    await createStatementUseCase.execute(statementWithdraw);

    const statement = await getBalanceUseCase.execute({ user_id: user.id });

    expect(statement).toHaveProperty("balance");
    expect(statement.balance).toEqual(350);
  });

  it("should be able make deposit and get not balance with user nonexistent", () => {
    expect(async () => {
      const depositValue = 100;

      const user: User = await createUserUseCase.execute({
        name: "Test user",
        email: "user@test.com",
        password: "1234"
      });

      Object.assign(statementDeposit, {
        user_id: user.id,
        type: "deposit",
        amount: depositValue,
        description: "Deposit in statement"
      });

      await createStatementUseCase.execute(statementDeposit);

      await getBalanceUseCase.execute({ user_id: "1234" });
    }).rejects.toBeInstanceOf(GetBalanceError);
  });
});
