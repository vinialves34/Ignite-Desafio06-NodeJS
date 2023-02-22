import { CreateStatementUseCase } from './CreateStatementUseCase';
import { InMemoryStatementsRepository } from '../../repositories/in-memory/InMemoryStatementsRepository';
import { InMemoryUsersRepository } from '@modules/users/repositories/in-memory/InMemoryUsersRepository';
import { CreateUserUseCase } from '@modules/users/useCases/createUser/CreateUserUseCase';
import { User } from '@modules/users/entities/User';
import { ICreateStatementDTO } from './ICreateStatementDTO';
import { Statement } from '../../entities/Statement';
import { AppError } from '@shared/errors/AppError';
import { v4 as uuid } from 'uuid';

let createStatementUseCase: CreateStatementUseCase;
let statementsRepositoryInMemory: InMemoryStatementsRepository;
let usersRepositoryInMemory: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let statementDeposit: Statement;
let statementWithdraw: Statement;

describe("Create Statement", () => {
  beforeEach(() => {
    statementDeposit = new Statement();
    statementWithdraw = new Statement();
    usersRepositoryInMemory = new InMemoryUsersRepository();
    statementsRepositoryInMemory = new InMemoryStatementsRepository();
    createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory);
    createStatementUseCase = new CreateStatementUseCase(usersRepositoryInMemory, statementsRepositoryInMemory);
  });

  it("should be able create statement and make a deposit", async () => {
    const user: User = await createUserUseCase.execute({
      name: "Test user",
      email: "user@test.com",
      password: "1234"
    });

    Object.assign(statementDeposit, {
      user_id: user.id,
      type: "deposit",
      amount: 100,
      description: "Deposit in statement"
    });

    const deposit = await createStatementUseCase.execute(statementDeposit);

    expect(deposit).toHaveProperty("id");
    expect(deposit).toBeInstanceOf(Statement);
    expect(deposit.type).toEqual("deposit");
  });

  it("should be able create statement and make a withdraw", async () => {
    const user: User = await createUserUseCase.execute({
      name: "Test user",
      email: "user@test.com",
      password: "1234"
    });

    Object.assign(statementDeposit, {
      user_id: user.id,
      type: "deposit",
      amount: 100,
      description: "Deposit in statement"
    });

    await createStatementUseCase.execute(statementDeposit);

    Object.assign(statementWithdraw, {
      user_id: user.id,
      type: "withdraw",
      amount: 90,
      description: "Withdraw in statement"
    });

    const withdraw = await createStatementUseCase.execute(statementWithdraw);

    expect(withdraw).toHaveProperty("id");
    expect(withdraw).toBeInstanceOf(Statement);
    expect(withdraw.type).toEqual("withdraw");
  });

  it("should be able create statement and make a withdraw with insufficient funds", () => {
    expect(async () => {
      const user: User = await createUserUseCase.execute({
        name: "Test user",
        email: "user@test.com",
        password: "1234"
      });

      Object.assign(statementDeposit, {
        user_id: user.id,
        type: "deposit",
        amount: 100,
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
    }).rejects.toBeInstanceOf(AppError);
  });

  it("should be able create statement and make a withdraw with user nonexistent", () => {
    expect(async () => {
      const user: User = await createUserUseCase.execute({
        name: "Test user",
        email: "user@test.com",
        password: "1234"
      });

      Object.assign(statementDeposit, {
        user_id: user.id,
        type: "deposit",
        amount: 100,
        description: "Deposit in statement"
      });

      await createStatementUseCase.execute(statementDeposit);

      Object.assign(statementWithdraw, {
        user_id: uuid(),
        type: "withdraw",
        amount: 90,
        description: "Withdraw in statement"
      });

      await createStatementUseCase.execute(statementWithdraw);
    }).rejects.toBeInstanceOf(AppError);
  });

  it("should be able create statement and make a deposit with user nonexistent", () => {
    expect(async () => {
      await createUserUseCase.execute({
        name: "Test user",
        email: "user@test.com",
        password: "1234"
      });

      Object.assign(statementDeposit, {
        user_id: uuid(),
        type: "deposit",
        amount: 100,
        description: "Deposit in statement"
      });

      await createStatementUseCase.execute(statementDeposit);
    }).rejects.toBeInstanceOf(AppError);
  });
});
