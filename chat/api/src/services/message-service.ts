import { DateTime } from 'luxon';
import { MongoClient, OptionalId } from 'mongodb';
import { v4 as uuid } from 'uuid';
import { APIError } from '../utils/ResponseUtils';

interface Message {
  id: string;
  datetime: string;
  sender: string;
  content: string;
}

abstract class BaseMessageService {
  abstract get(id: string): Promise<Message | undefined>
  abstract delete(id: string): Promise<void>;
  abstract save(sender: string, content: string): Promise<Message>;
  abstract list(pageNumber: number, pageSize: number): Promise<{ messages: Message[], total: number }>;

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

  async get(id: string): Promise<Message | undefined> {
    const index = InMemoryUserService.messages.findIndex(message => message.id === id);
    return index === -1 ? undefined : InMemoryUserService.messages[index];
  }

  async delete(id: string): Promise<void> {
    const index = InMemoryUserService.messages.findIndex(message => message.id === id);
    if (index === -1) {
      throw BaseMessageService.notFound(id);
    }
    InMemoryUserService.messages.splice(index, 1);
  }

  async list(pageNumber: number, pageSize: number): Promise<{ messages: Message[], total: number }> {
    const start = pageNumber * pageSize;
    return {
      total: InMemoryUserService.messages.length,
      messages: InMemoryUserService.messages.slice(start, start + pageSize),
    };
  }

  async save(sender: string, content: string): Promise<Message> {
    const message = BaseMessageService.message(sender, content);
    InMemoryUserService.messages.unshift(message);
    return message;
  }
}

const {
  DB_USER,
  DB_PASSWORD,
  DB_HOST,
  DB_PORT,
  DB_NAME,
} = process.env;

export class MongoDBUserService extends BaseMessageService {
  private readonly client = new MongoClient(`mongodb://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}?authSource=admin`);
  private readonly messages = this.client.db(DB_NAME).collection<Message>('Messages');

  constructor() {
    super();
    this.client.connect();
  }

  async get(id: string): Promise<Message | undefined> {
    const result = await this.messages.findOne({ id });
    delete (result as OptionalId<Message>)._id;
    return result || undefined;
  }

  async delete(id: string): Promise<void> {
    const result = await this.messages.deleteOne({ id });
    if (result.deletedCount === 0) {
      throw BaseMessageService.notFound(id);
    }
  }
  async list(pageNumber: number, pageSize: number): Promise<{ messages: Message[]; total: number }> {
    return {
      total: await this.messages.estimatedDocumentCount(),
      messages: (await this.messages.find()
        .sort('datetime', 'desc')
        .skip(pageNumber * pageSize)
        .limit(pageSize)
        .toArray())
        .map((m: OptionalId<Message>) => { delete m._id; return m; }),
    };
  }
  async save(sender: string, content: string): Promise<Message> {
    const message = BaseMessageService.message(sender, content);
    await this.messages.insertOne(message);
    delete (message as OptionalId<Message>)._id;
    return message;
  }

}

export const messageService = process.env.DB === 'mongodb' ? new MongoDBUserService() : new InMemoryUserService();
