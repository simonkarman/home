import { Request, Response, NextFunction, RequestHandler } from 'express';
import { logRequest, logResponse } from './LoggingUtils';

interface APIResponse<TBody> {
  statusCode: number;
  body: TBody;
}

interface Body {
  code: string;
  message: string;
}

export interface OkResponse<TBody> extends APIResponse<TBody> {
  statusCode: 200 | 201;
  body: TBody;
}

export interface NoContentResponse extends APIResponse<undefined> {
  statusCode: 204;
}

interface BadRequestCause {
  path: string;
  type: string;
  message: string;
}

interface BadRequestBody extends Body {
  code: string;
  message: string;
  causes: BadRequestCause[];
}

export interface BadRequestResponse extends APIResponse<BadRequestBody> {
  statusCode: 400 | 404;
  body: BadRequestBody;
}

interface UnauthorizedBody extends Body {
  code: 'UNAUTHORIZED';
}

export interface UnauthorizedResponse extends APIResponse<UnauthorizedBody> {
  statusCode: 401 | 403;
  body: UnauthorizedBody;
}

interface NotFoundBody extends Body {
  type: string;
  id: string;
}

export interface NotFoundResponse extends APIResponse<NotFoundBody> {
  statusCode: 404;
  body: NotFoundBody;
}

interface InternalServerErrorBody extends Body {
  code: 'INTERNAL_SERVER_ERROR';
  message: 'Internal Server Error';
}

export interface InternalServerErrorResponse extends APIResponse<InternalServerErrorBody> {
  statusCode: 500;
  body: InternalServerErrorBody;
}

export type AnyAPIResponse<T> = OkResponse<T> | NoContentResponse | BadRequestResponse | UnauthorizedResponse | NotFoundResponse;

export class APIError<T> extends Error {
  private res: AnyAPIResponse<T>;

  constructor(res: AnyAPIResponse<T>) {
    super();
    this.res = res;
  }

  public getResponse(): AnyAPIResponse<T> {
    return this.res;
  }
}

export const handler = <T>(createResponse: (req: Request, res: Response, next: NextFunction)
  => Promise<AnyAPIResponse<T> | 'next'>): RequestHandler => async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    logRequest(req);
    let response: AnyAPIResponse<T> | InternalServerErrorResponse | 'next';
    try {
      response = await createResponse(req, res, next);
    } catch (error) {
      if (error instanceof APIError) {
        response = error.getResponse();
      } else {
        response = { statusCode: 500, body: { code: 'INTERNAL_SERVER_ERROR', message: 'Internal Server Error' } };
      }
    }
    if (response === 'next') {
      next();
    } else {
      logResponse(req, response);
      res.header('Book-Server-API-Version', '1.0');
      res.contentType('application/json');
      res.status(response.statusCode);
      res.send(response.body);
    }
  };
