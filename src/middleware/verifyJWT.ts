import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import {
  createUnauthorizedError,
  createInvalidTokenError,
  createErrorResponse,
  isAppError,
} from '../exceptions';

interface Token {
  userId: string;
}

declare module 'express-serve-static-core' {
  interface Request {
    userId: string;
  }
}

export const verifyJWT = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      const error = createUnauthorizedError();
      return res.status(error.statusCode).json(createErrorResponse(error));
    }

    const token = authHeader.split(' ')[1];
    jwt.verify(token, env.ACCESS_TOKEN_SECRET, (err, decoded) => {
      if (err) {
        const error = createInvalidTokenError();
        return res.status(error.statusCode).json(createErrorResponse(error));
      }
      const { userId } = decoded as Token;
      req.userId = userId;
      next();
    });
  } catch (err: unknown) {
    if (isAppError(err)) {
      return res.status(err.statusCode).json(createErrorResponse(err));
    }
    const error = createInvalidTokenError();
    res.status(error.statusCode).json(createErrorResponse(error));
  }
};
