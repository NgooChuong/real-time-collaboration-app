import express, { Express } from 'express';
import swaggerInit from './config';

export const createApp = (): Express => {
  const app: Express = express();

  // Middlewares
  app.use(express.json());

  // Swagger setup (uses existing config)
  swaggerInit(app);

  // Health check
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  return app;
};

export default createApp;


