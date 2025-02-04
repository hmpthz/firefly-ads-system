import { HandledError } from '@/utils/errors.js';
import { type ErrorRequestHandler } from 'express';

export const errorHandler: () => ErrorRequestHandler =
  () => (err, _req, res, _next) => {
    let message: string;
    let statusCode = 500;

    if (err instanceof HandledError) {
      message = err.errmsg;
      statusCode = err.statusCode;
    } else if (err instanceof Error) {
      message = `${err.name}: ${err.message}`;
    } else {
      message = `Unknown error`;
    }

    console.error(message);
    res.status(statusCode).json({ error: message });
  };
