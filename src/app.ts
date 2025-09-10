import express, { Express, Request } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import swaggerInit from './config';
import { corsOptions } from './config/corsOptions';
import { credentials } from './middleware/credentials';
import authRouter from './modules/auth/auth.routes';
import usersRouter from './modules/users/users.routes';
import messagesRouter from './modules/messages/messages.routes';
import conversationsRouter from './modules/conversations/conversations.routes';

export const createApp = (): Express => {
  const app: Express = express();

  // Middlewares
  app.use(credentials);
  app.use(cors<Request>(corsOptions));
  app.use(express.json());
  app.use(cookieParser());

  // Swagger setup (uses existing config)
  swaggerInit(app);

  // RoutesW
  app.use('/api/auth', authRouter);
  app.use('/api/users', usersRouter);
  app.use('/api/messages', messagesRouter);
  app.use('/api/conversations', conversationsRouter);

  // Health check
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  return app;
};

export default createApp;
