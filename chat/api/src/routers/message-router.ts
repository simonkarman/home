import express, { Request } from 'express';
import { messageService } from '../services/message-service';
import { APIError, handler } from '../utils/ResponseUtils';
import { requireValidSession, SessionRequest } from '../utils/SessionUtils';

export const messageRouter = express.Router();
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
  if (isNaN(result)) {
    throw new APIError({
      statusCode: 400,
      body: {
        code: 'BAD_REQUEST',
        message: `${name} has an incorrect value`,
        causes: [{ message: 'should be a number', path: name, type: 'query' }],
      },
    });
  }
  return result;
};

messageRouter.get('/', requireValidSession(), handler(async (req: Request) => {
  const { pageNumber: _pageNumber, pageSize: _pageSize } = req.query || {};
  const pageNumber = asNumber(_pageNumber, 'pageNumber');
  const pageSize = asNumber(_pageSize, 'pageSize');
  if (pageNumber < 0) {
    throw new APIError({
      statusCode: 400,
      body: {
        code: 'BAD_REQUEST',
        message: 'pageNumber has an incorrect value',
        causes: [{ message: 'should be greater than 0', path: 'pageNumber', type: 'query' }],
      },
    });
  }
  if (pageSize < 1 || pageSize > 25) {
    throw new APIError({
      statusCode: 400,
      body: {
        code: 'BAD_REQUEST',
        message: 'pageSize has an incorrect value',
        causes: [{ message: 'should be at least 1 and at maximum 25', path: 'pageSize', type: 'query' }],
      },
    });
  }
  return {
    statusCode: 200,
    body: await messageService.list(pageNumber, pageSize),
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
