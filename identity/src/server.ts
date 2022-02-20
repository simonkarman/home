import express from 'express';
import cookieParser from 'cookie-parser';
import { healthRouter } from './routers/health-router';
import { sessionRouter } from './routers/session-router';

const app = express();
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/health', healthRouter);
app.use('/sessions', sessionRouter);

// Start server
// eslint-disable-next-line no-process-env
const port = process.env.PORT || 80;
app.listen(port, () => {
  console.info(`Identity Service listening on port ${port}`);
});
