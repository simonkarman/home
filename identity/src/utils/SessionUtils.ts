import { Request, RequestHandler } from 'express';
import fs from 'fs';
import jwt, { SignOptions, VerifyOptions } from 'jsonwebtoken';
import { handler } from './ResponseUtils';
import { UserSessionDetails } from '../services/user-service';

// eslint-disable-next-line no-process-env
const privateKey = fs.readFileSync(`/etc/letsencrypt/live/${process.env.DOMAIN_NAME}/privkey.pem`, { encoding: 'utf-8' });

export const SESSION_TOKEN_COOKIE_NAME = 'session-token';

export interface Session {
  iss: string;
  user: UserSessionDetails
}

export interface SessionRequest extends Request {
  session: Session;
}

export interface OptionalSessionRequest extends Request {
  session: Session | undefined;
}

export const sessionToToken = (session: Session): string => {
  const signOptions: SignOptions = {
    algorithm: 'HS256',
    expiresIn: '1h',
  };
  return jwt.sign(session, privateKey, signOptions);
};

export const tokenToSession = (token: string | undefined): Session | undefined => {
  if (token === undefined) {
    return undefined;
  }
  const options: VerifyOptions = {
    algorithms: ['HS256'],
  };
  try {
    const payload = jwt.verify(token, privateKey, options);
    return payload as Session;
  } catch (error) {
    return undefined;
  }
};

export const requireValidSession = (): RequestHandler => handler(async (req, res) => {
  const session = tokenToSession(req.cookies[SESSION_TOKEN_COOKIE_NAME]);
  if (session === undefined) {
    res.clearCookie(SESSION_TOKEN_COOKIE_NAME);
    return {
      statusCode: 401,
      body: {
        code: 'UNAUTHORIZED',
        message: 'Session is missing, invalid, or expired.',
      },
    };
  }
  (req as SessionRequest).session = session;
  return 'next';
});

export const optionalValidSession = (): RequestHandler => handler(async (req, res) => {
  try {
    const session = tokenToSession(req.cookies[SESSION_TOKEN_COOKIE_NAME]);
    if (session === undefined) {
      res.clearCookie(SESSION_TOKEN_COOKIE_NAME);
    } else {
      (req as OptionalSessionRequest).session = session;
    }
  } finally { /* nothing */ }
  return 'next';
});
