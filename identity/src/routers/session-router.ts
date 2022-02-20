import express, { CookieOptions } from 'express';
import { IBasicAuthedRequest } from 'express-basic-auth';

import { sessionToToken, Session, SessionRequest, requireValidSession, SESSION_TOKEN_COOKIE_NAME } from '../utils/SessionUtils';
import { handler, APIError } from '../utils/ResponseUtils';
import basicAuth from '../utils/BasicAuthentication';
import { userService } from '../services/user-service';

export const sessionRouter = express.Router();

const cookieOptions : CookieOptions = {
  secure: true,
  httpOnly: true,
};

sessionRouter.post('/', basicAuth, handler<Session>(async (req, res) => {
  res.clearCookie(SESSION_TOKEN_COOKIE_NAME, cookieOptions);

  const { auth } = req as IBasicAuthedRequest;
  const user = await userService.getByUsername(auth.user);
  const session: Session = {
    iss: 'Example',
    user: userService.toSessionDetails(user),
  };
  const sessionToken = sessionToToken(session);
  res.cookie(
    SESSION_TOKEN_COOKIE_NAME,
    sessionToken,
    cookieOptions,
  );
  return {
    statusCode: 201,
    body: session,
  };
}));

sessionRouter.delete('/', handler(async (req, res) => {
  if (req.cookies[SESSION_TOKEN_COOKIE_NAME] === undefined) {
    throw new APIError({
      statusCode: 404,
      body: {
        code: 'SESSION_NOT_FOUND',
        message: 'You\'re not logged in.',
        type: 'session',
        id: '<none>',
      },
    });
  }
  res.clearCookie(SESSION_TOKEN_COOKIE_NAME, cookieOptions);
  return { statusCode: 204, body: undefined };
}));

sessionRouter.get('/', requireValidSession(), handler<Session>(async (request) => {
  const req = (request as SessionRequest);
  return {
    statusCode: 200,
    body: req.session,
  };
}));
