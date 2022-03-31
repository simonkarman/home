import express from 'express';
import { handler } from '../utils/ResponseUtils';

export const healthRouter = express.Router();

healthRouter.get('/', handler(async () => ({
  statusCode: 200,
  body: {
    api: 'OK',
    database: process.env.DB || 'in-memory',
    domain: process.env.DOMAIN,
  },
})));
