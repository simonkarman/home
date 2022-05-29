if (process.env.DOMAIN === undefined || process.env.JWT_KEY_FILE === undefined) {
  throw new Error('[ERROR] Missing startup configuration. Please make sure environment variables \'DOMAIN\' and \'JWT_KEY_FILE\' are set.');
}

import express from 'express';
import cookieParser from 'cookie-parser';
import { healthRouter } from './routers/health-router';
import { messageRouter } from './routers/message-router';

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.use('/health', healthRouter);
app.use('/messages', messageRouter);

// Start server
const port = process.env.PORT || 3003;
app.listen(port, () => {
  console.info(`ChatAPI listening on port ${port}`);
});
