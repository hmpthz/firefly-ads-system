import express from 'express';
import cookieParser from 'cookie-parser';
import { apiRouter } from './routes/index.js';
import { errorHandler } from './middlewares/error.middleware.js';
import { connectDatabase } from './utils/db.js';

function main() {
  const app = express();

  app.use(async (_req, res, next) => {
    res.locals.db = await connectDatabase();
    return next();
  });

  app.use(express.json());
  app.use(cookieParser());
  app.use('/api', apiRouter);

  app.get('/api/hello', (_req, res) => {
    res.json({ message: 'Hello, world!' });
  });

  app.use(errorHandler());
  return app;
}

export default main();
