import { DateTime } from 'luxon';
import { v4 as uuid } from 'uuid';
import { APIError } from '../utils/ResponseUtils';

interface Message {
  id: string;
  datetime: string;
  sender: string;
  content: string;
}

abstract class BaseMessageService {
  protected abstract delete(id: string): Promise<void>;
  protected abstract send(sender: string, message: string): Promise<Message>;
  public abstract list(pageNumber: number, pageSize: number): Promise<{ messages: Message[], total: number }>;

  static message(sender: string, content: string): Message {
    return {
      id: uuid(),
      datetime: DateTime.now().toISO(),
      sender,
      content,
    };
  }

  static notFound(id: string) {
    return new APIError({ statusCode: 404, body: {
      code: 'NOT_FOUND',
      message: 'You can not delete a message that does not exist',
      type: 'Message',
      id,
    } });
  }
}

export class InMemoryUserService extends BaseMessageService {
  private static readonly messages: Message[] = [
    { id: uuid(), datetime: DateTime.now().minus({ minute: 3 }).toISO(), sender: 'simon', content: 'Hoe gaat het?' },
    { id: uuid(), datetime: DateTime.now().minus({ minute: 5 }).toISO(), sender: 'lisa', content: 'Hallo!' },
    { id: uuid(), datetime: DateTime.now().minus({ minute: 7 }).toISO(), sender: 'simon', content: 'Hallo!' },
  ];

  async delete(id: string): Promise<void> {
    const index = InMemoryUserService.messages.findIndex(message => message.id === id);
    const exists = index !== -1;
    if (exists) {
      InMemoryUserService.messages.splice(index, 1);
    } else {
      throw BaseMessageService.notFound(id);
    }
  }

  async list(pageNumber: number, pageSize: number): Promise<{ messages: Message[], total: number }> {
    const start = Math.max(0, pageNumber * pageSize);
    return {
      total: InMemoryUserService.messages.length,
      messages: InMemoryUserService.messages.slice(start, start + Math.max(1, pageSize)),
    };
  }

  async send(sender: string, content: string): Promise<Message> {
    const message = BaseMessageService.message(sender, content);
    InMemoryUserService.messages.push(message);
    return message;
  }
}

// const {
//   DB_USER,
//   DB_PASSWORD,
//   DB_HOST,
//   DB_PORT,
//   DB_NAME,
// } = process.env;
//
// export class MongoDBUserService extends BaseMessageService {
//   private readonly client = new MongoClient(`mongodb://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}?authSource=admin`);
//   private readonly users = this.client.db(DB_NAME).collection<Message>('Chat');
//
//   async findByUsername(username: string): Promise<Message | undefined> {
//     await this.client.connect();
//     const user = await this.users.findOne({ username });
//     return user || undefined;
//   }
//
// }
//
// export const messageService = process.env.DB === 'mongodb' ? new MongoDBUserService() : new InMemoryUserService();
export const messageService = new InMemoryUserService();
