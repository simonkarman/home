import express, { Request } from 'express';
import { userService } from '../services/user-service';
import { asString, asNumber, asStringArray } from '../utils/InputUtils';
import { APIError, handler } from '../utils/ResponseUtils';
import { SessionRequest } from '../utils/SessionUtils';

export const userRouter = express.Router();

userRouter.get('/', handler(async (req: Request) => {
  const { pageNumber: _pageNumber, pageSize: _pageSize } = req.query || {};
  const pageNumber = asNumber(_pageNumber, 'pageNumber', 'query');
  const pageSize = asNumber(_pageSize, 'pageSize', 'query');
  return {
    statusCode: 200,
    body: await userService.list(pageNumber, pageSize),
  };
}));

userRouter.post('/', handler(async (req: Request) => {
  const { username: _username, password: _password, scopes: _scopes } = req.body || {};
  const username = asString(_username, 'username', 'body');
  const password = asString(_password, 'password', 'body');
  const scopes = asStringArray(_scopes, 'scopes', 'body');
  return {
    statusCode: 200,
    body: await userService.create(username, password, scopes),
  };
}));

userRouter.delete('/:username', handler(async (req: Request) => {
  const { username: _username } = req.params || {};
  const username = asString(_username, 'username', 'path');
  if (username === (req as SessionRequest).session.user.username) {
    throw new APIError({
      statusCode: 400,
      body: {
        code: 'BAD_REQUEST',
        message: 'You cannot delete yourself',
        causes: [{ message: 'you cannot delete a user with your username', path: username, location: 'path' }],
      },
    });
  }
  return {
    statusCode: 200,
    body: await userService.delete(username),
  };
}));
