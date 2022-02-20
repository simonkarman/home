import express from 'express';
import { handler } from '../utils/ResponseUtils';

export const healthRouter = express.Router();

export type HealthStatus = 'OK' | 'ERROR';
export interface HealthSummary {
  api: HealthStatus;
}

healthRouter.get('/', handler<HealthSummary>(async () => {
  return { statusCode: 200, body: { api: 'OK' } };
}));
