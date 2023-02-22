import { User } from '@modules/users/entities/User';
import { InMemoryUsersRepository } from '../../repositories/in-memory/InMemoryUsersRepository';
import { CreateUserUseCase } from '../createUser/CreateUserUseCase';
import { ShowUserProfileUseCase } from './ShowUserProfileUseCase';
import { ShowUserProfileError } from './ShowUserProfileError';

let createUserUseCase: CreateUserUseCase;
let usersRepositoryInMemory: InMemoryUsersRepository;
let showUserProfileUseCase: ShowUserProfileUseCase;

describe("Show User Profile", () => {
  beforeEach(() => {
    usersRepositoryInMemory = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory);
    showUserProfileUseCase = new ShowUserProfileUseCase(usersRepositoryInMemory);
  });

  it("should be able find user profile", async () => {
    const user = await createUserUseCase.execute({
      name: "Test user",
      email: "user@test.com",
      password: "1234"
    });

    const userProfile = await showUserProfileUseCase.execute(user.id);

    expect(userProfile).toBeInstanceOf(User);
  });

  it("should not be able find user profile if not exists", async () => {
    expect(async () => {
      await showUserProfileUseCase.execute("1234");
    }).rejects.toBeInstanceOf(ShowUserProfileError);
  });
});
