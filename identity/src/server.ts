if (process.env.DOMAIN === undefined || process.env.JWT_KEY_FILE === undefined) {
  throw new Error('[ERROR] Missing startup configuration. Please make sure environment variables \'DOMAIN\' and \'JWT_KEY_FILE\' are set.');
}

import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { healthRouter } from './routers/health-router';
import { sessionRouter } from './routers/session-router';

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/health', healthRouter);
app.use('/sessions', sessionRouter);

// Start server
const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.info(`Identity Service listening on port ${port}`);
});
