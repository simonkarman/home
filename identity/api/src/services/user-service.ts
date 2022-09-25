import { APIError } from '../utils/ResponseUtils';
import { MongoClient, OptionalId } from 'mongodb';
import bcrypt from 'bcrypt';

export const SALT_ROUNDS = 10;

export interface User {
  username: string;
  password: string;
  scopes: string[];
}
export type UserWithoutPassword = Omit<User, 'password'> & { password?: undefined };

export const toUserWithoutPassword = (user: User): UserWithoutPassword => {
  const userWithoutPassword = { ...user, password: undefined };
  delete userWithoutPassword.password;
  return userWithoutPassword;
};

abstract class BaseUserService {
  public abstract findByUsername(username: string): Promise<User | undefined>;
  public async getByUsername(username: string): Promise<User> {
    const user = await this.findByUsername(username);
    if (user === undefined) {
      throw new APIError({
        statusCode: 404,
        body: {
          code: 'USER_NOT_FOUND',
          message: `A user with username '${username}' does not exist.`,
          type: 'user',
          id: username,
        },
      });
    }
    return user;
  }

  public async list(pageNumber: number, pageSize: number): Promise<{ total: number, users: UserWithoutPassword[] }> {
    if (pageNumber < 0) {
      throw new APIError({
        statusCode: 400,
        body: {
          code: 'BAD_REQUEST',
          message: 'pageNumber has an incorrect value',
          causes: [{ message: 'should be greater than 0', path: 'pageNumber', location: 'query' }],
        },
      });
    }
    if (pageSize < 1 || pageSize > 25) {
      throw new APIError({
        statusCode: 400,
        body: {
          code: 'BAD_REQUEST',
          message: 'pageSize has an incorrect value',
          causes: [{ message: 'should be at least 1 and at maximum 25', path: 'pageSize', location: 'query' }],
        },
      });
    }
    const raw = await this._list(pageNumber, pageSize);
    return {
      total: raw.total,
      users: raw.users.map(toUserWithoutPassword),
    };
  }
  protected abstract _list(pageNumber: number, pageSize: number): Promise<{ total: number, users: User[] }>

  public async create(username: string, password: string, scopes: string[]): Promise<User> {
    if (username.length < 3 || username.length > 25) {
      throw new APIError({
        statusCode: 400,
        body: {
          code: 'BAD_REQUEST',
          message: 'username has an invalid length',
          causes: [{ message: 'should be at least 3 and at maximum 25 characters long', path: 'username', location: 'body' }],
        },
      });
    } else if (!(/^[a-z0-9\-_]+$/i.test(username))) {
      throw new APIError({
        statusCode: 400,
        body: {
          code: 'BAD_REQUEST',
          message: 'username uses invalid characters',
          causes: [{ message: 'should only use alphanumeric characters, dashes (-), and/or underscores (_)', path: 'username', location: 'body' }],
        },
      });
    }
    if (!(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,128}$/.test(password))) {
      throw new APIError({
        statusCode: 400,
        body: {
          code: 'BAD_REQUEST',
          message: 'password is not strong enough',
          causes: [{
            message: 'should have at at least 8 and at most 128 characters and have ' +
              'at least one uppercase letter, one lowercase letter, one digit, and one special character (#?!@$%^&*-)',
            path: 'password',
            location: 'body',
          }],
        },
      });
    }
    const invalidScopeIndex = scopes.findIndex(scope => !(/^[a-z0-9\-_]{3,128}$/i.test(scope)));
    if (invalidScopeIndex >= 0) {
      throw new APIError({
        statusCode: 400,
        body: {
          code: 'BAD_REQUEST',
          message: 'one of the scopes is invalid',
          causes: [{
            message: 'should have at at least 3 and at most 128 characters and only use alphanumeric characters, dashes (-), and/or underscores (_)',
            path: `scopes[${invalidScopeIndex}]`,
            location: 'body',
          }],
        },
      });
    }
    if (await this.findByUsername(username)) {
      throw new APIError({
        statusCode: 400,
        body: {
          code: 'BAD_REQUEST',
          message: `A user with username '${username}' already exists`,
          causes: [{ message: 'already taken', path: username, location: 'body' }],
        },
      });
    }
    return this._create(username, password, scopes);
  }
  protected abstract _create(username: string, password: string, scopes: string[]): Promise<User>;

  public async delete(username: string): Promise<void> {
    if ((await this.findByUsername(username)) === undefined) {
      throw new APIError({
        statusCode: 404,
        body: {
          code: 'USER_NOT_FOUND',
          message: `A user with username '${username}' does not exist.`,
          type: 'user',
          id: username,
        },
      });
    }
    return this._delete(username);
  }
  protected abstract _delete(username: string): Promise<void>;
}

export class InMemoryUserService extends BaseUserService {
  private static readonly users: User[] = [
    { username: 'simon', password: bcrypt.hashSync('123', SALT_ROUNDS), scopes: ['admin'] },
    { username: 'lisa', password: bcrypt.hashSync('456', SALT_ROUNDS), scopes: [] },
  ];

  constructor() {
    super();
    console.info('In Memory Users', InMemoryUserService.users);
  }

  async findByUsername(username: string): Promise<User | undefined> {
    return InMemoryUserService.users.find(user => user.username.toLowerCase() === username.toLowerCase());
  }

  protected async _list(pageNumber: number, pageSize: number): Promise<{ total: number, users: User[] }> {
    const start = pageNumber * pageSize;
    return {
      total: InMemoryUserService.users.length,
      users: InMemoryUserService.users
        .sort((a, b) => a.username.localeCompare(b.username))
        .slice(start, start + pageSize),
    };
  }

  protected async _create(username: string, password: string, scopes: string[]): Promise<User> {
    const user = { username, password, scopes };
    InMemoryUserService.users.push(user);
    return user;
  }

  protected async _delete(username: string): Promise<void> {
    const index = InMemoryUserService.users.findIndex(user => user.username === username);
    if (index === -1) {
      throw new Error('Cannot remove a user that does not exist.');
    }
    InMemoryUserService.users.splice(index, 1);
  }
}

const {
  DB_USER,
  DB_PASSWORD,
  DB_HOST,
  DB_PORT,
  DB_NAME,
} = process.env;

export class MongoDBUserService extends BaseUserService {
  private readonly client = new MongoClient(`mongodb://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}?authSource=admin`);
  private readonly users = this.client.db(DB_NAME).collection<User>('Users');

  constructor() {
    super();
    this.client.connect();
  }

  async findByUsername(username: string): Promise<User | undefined> {
    const user = await this.users.findOne({ username });
    return user || undefined;
  }

  protected async _list(pageNumber: number, pageSize: number): Promise<{ total: number, users: User[] }> {
    return {
      total: await this.users.estimatedDocumentCount(),
      users: (await this.users.find()
        .sort('username', 'asc')
        .skip(pageNumber * pageSize)
        .limit(pageSize)
        .toArray())
        .map((m: OptionalId<User>) => { delete m._id; return m; }),
    };
  }

  protected async _create(username: string, password: string, scopes: string[]): Promise<User> {
    const user = { username, password: bcrypt.hashSync(password, SALT_ROUNDS), scopes };
    await this.users.insertOne(user);
    delete (user as OptionalId<User>)._id;
    return user;
  }

  protected async _delete(username: string): Promise<void> {
    await this.users.deleteOne({ username });
  }
}

export const userService = process.env.DB === 'mongodb' ? new MongoDBUserService() : new InMemoryUserService();
