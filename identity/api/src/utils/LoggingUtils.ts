import { Request } from 'express';
import chalk from 'chalk';
import { v4 as uuid } from 'uuid';
import { SESSION_TOKEN_COOKIE_NAME } from './SessionUtils';
import { AnyAPIResponse, InternalServerErrorResponse } from './ResponseUtils';

const base64ToString = (data: string) => {
  const buff = Buffer.from(data, 'base64');
  return buff.toString('ascii');
};

const getUsernameUnsafe = (jwt: string | undefined) => {
  if (!jwt) {
    return null;
  }
  const jwtParts = jwt.split('.');
  if (jwtParts.length !== 3) {
    return null;
  }
  const { user: { username } } = JSON.parse(base64ToString(jwtParts[1]));
  return username;
};

interface MetadataRequest extends Request {
  requestId: string | undefined;
  startTime: number;
}

const logHeader = (header: string): void => console.log(`\n  ${chalk.white.bgGray(header)}`);
const logLine = (prefix: string, object: string | unknown): void =>
  console.log(`  ${chalk.yellowBright.bgGray(prefix)}`, JSON.stringify(object, undefined, undefined).substring(0, 200));

export const logRequest = (request: Request): void => {
  const req = request as MetadataRequest;
  if (req.requestId !== undefined) {
    return;
  }
  req.requestId = uuid();
  req.startTime = Date.now();

  const { method, originalUrl } = req;
  const user = getUsernameUnsafe(req.cookies === undefined ? undefined : req.cookies[SESSION_TOKEN_COOKIE_NAME]);

  const styledMethod = method === 'GET' ? method : chalk.yellowBright(method);
  const styledPath = chalk.yellow(originalUrl);
  const styledUser = user ? chalk.greenBright(user) : 'anonymous';
  logHeader(`${styledMethod} ${styledPath} by ${styledUser}`);
  logLine('>', `requestId: ${req.requestId}`);
  if (method !== 'GET') {
    logLine('>', req.body);
  }
};

export const logResponse = <T>(request: Request, response: AnyAPIResponse<T> | InternalServerErrorResponse): void => {
  const req = request as MetadataRequest;
  logLine('<', response);
  logLine('==', `Finished in ${Date.now() - req.startTime} ms`);
};
