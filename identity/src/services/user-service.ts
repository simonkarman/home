import { APIError } from '../utils/ResponseUtils';
import { MongoClient } from 'mongodb';
import bcrypt from 'bcrypt';

export const SALT_ROUNDS = 10;

export interface UserSessionDetails {
  username: string;
  scopes: string[];
}

export interface User {
  username: string;
  password: string;
  scopes: string[];
}

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

  public toSessionDetails(user: User): UserSessionDetails {
    return { username: user.username, scopes: user.scopes };
  }
}

export class InMemoryUserService extends BaseUserService {
  private static readonly users: User[] = [
    { username: 'simon', password: bcrypt.hashSync('123', SALT_ROUNDS), scopes: ['admin', 'user'] },
    { username: 'lisa', password: bcrypt.hashSync('456', SALT_ROUNDS), scopes: ['user'] },
  ];

  constructor() {
    super();
    console.info('In Memory Users', InMemoryUserService.users);
  }

  async findByUsername(username: string): Promise<User | undefined> {
    return InMemoryUserService.users.find(user => user.username.toLowerCase() === username.toLowerCase());
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

  async findByUsername(username: string): Promise<User | undefined> {
    await this.client.connect(); // TODO: replace with reusing the same connection for multiple requests
    const user = await this.users.findOne({ username });
    return user || undefined;
  }
}

export const userService = process.env.DB === 'mongodb' ? new MongoDBUserService() : new InMemoryUserService();
