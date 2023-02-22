import { Statement } from "@modules/statements/entities/Statement";
import { InMemoryStatementsRepository } from "@modules/statements/repositories/in-memory/InMemoryStatementsRepository";
import { InMemoryUsersRepository } from "@modules/users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "@modules/users/useCases/createUser/CreateUserUseCase";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";
import { AppError } from "@shared/errors/AppError";

let createStatementUseCase: CreateStatementUseCase;
let statementsRepositoryInMemory: InMemoryStatementsRepository;
let usersRepositoryInMemory: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let getStatementOperationUseCase: GetStatementOperationUseCase;
let statementDeposit: Statement;
let statementWithdraw: Statement;

describe("Get Statement Operation", () => {
  beforeEach(() => {
    statementDeposit = new Statement();
    statementWithdraw = new Statement();
    usersRepositoryInMemory = new InMemoryUsersRepository();
    statementsRepositoryInMemory = new InMemoryStatementsRepository();
    createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory);
    getStatementOperationUseCase = new GetStatementOperationUseCase(usersRepositoryInMemory, statementsRepositoryInMemory);
    createStatementUseCase = new CreateStatementUseCase(usersRepositoryInMemory, statementsRepositoryInMemory);
  });

  it("should be able get statement operation by user id and statement id", async () => {
    const depositValue = 100;

    const user = await createUserUseCase.execute({
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

    const statement = await createStatementUseCase.execute(statementDeposit);

    const getStatement = await getStatementOperationUseCase.execute({
      user_id: user.id,
      statement_id: statement.id
    });

    expect(getStatement).toBeInstanceOf(Statement);
  });

  it("should be able get not statement operation with user nonexistent", () => {
    expect(async () => {
      const depositValue = 100;

      const user = await createUserUseCase.execute({
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

      const statement = await createStatementUseCase.execute(statementDeposit);

      await getStatementOperationUseCase.execute({
        user_id: "1234",
        statement_id: statement.id
      });
    }).rejects.toBeInstanceOf(AppError);
  });

  it("should be able get not statement operation with statement nonexistent", () => {
    expect(async () => {
      const depositValue = 100;

      const user = await createUserUseCase.execute({
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

      const statement = await createStatementUseCase.execute(statementDeposit);

      await getStatementOperationUseCase.execute({
        user_id: user.id,
        statement_id: "1234"
      });
    }).rejects.toBeInstanceOf(AppError);
  });
});
