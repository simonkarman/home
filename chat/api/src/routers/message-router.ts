import express, { Request } from 'express';
import { messageService } from '../services/message-service';
import { APIError, handler } from '../utils/ResponseUtils';
import { requireValidSession, SessionRequest } from '../utils/SessionUtils';

export const messageRouter = express.Router();

messageRouter.get('/', requireValidSession(), handler(async (req: Request) => {
  const { pageNumber, pageSize } = req.query || {};
  const asNumber = (value: unknown, name: string): number => {
    if (typeof value !== 'string') {
      throw new APIError({
        statusCode: 400,
        body: {
          code: 'BAD_REQUEST',
          message: `${name} is not provided correctly`,
          causes: [{ message: 'not a string', path: name, type: 'query' }],
        },
      });
    }
    const result = Number.parseInt(value, 10);
    if (isNaN(result) || result < 0) {
      throw new APIError({
        statusCode: 400,
        body: {
          code: 'BAD_REQUEST',
          message: `${name} has an incorrect value`,
          causes: [{ message: 'should be a number greater than 0', path: name, type: 'query' }],
        },
      });
    }
    return result;
  };
  return {
    statusCode: 200,
    body: await messageService.list(asNumber(pageNumber, 'pageNumber'), asNumber(pageSize, 'pageSize')),
  };
}));

messageRouter.post('/', requireValidSession(), handler(async (_req: Request) => {
  const req = _req as SessionRequest;
  if (typeof req.body !== 'object' || typeof req.body.content !== 'string') {
    throw new APIError({
      statusCode: 400,
      body: {
        code: 'BAD_REQUEST',
        message: 'No body or incorrect body provided',
        causes: [{ message: 'body is not an object or body.content is not a string', type: 'body', path: 'content' }],
      },
    });
  }
  const { content } = req.body;
  const sender = req.session.user.username;
  return {
    statusCode: 200,
    body: await messageService.send(sender, content),
  };
}));

messageRouter.delete('/:id', requireValidSession(['admin']), handler(async (req: Request) => {
  const { id } = req.params || {};
  await messageService.delete(id);
  return {
    statusCode: 204,
    body: undefined,
  };
}));
