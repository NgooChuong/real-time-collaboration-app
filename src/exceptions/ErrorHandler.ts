import { Request, Response, NextFunction } from 'express';
import { AppError, isAppError } from './AppError';
import { HttpStatusCodes } from './HttpStatusCodes';
import { ErrorTypes } from './ErrorTypes';
import { logger } from '../utils/logger';

export const globalErrorHandler = (err: Error | AppError, _req: Request, res: Response) => {
  logger.error('Error occurred:', err);

  if (isAppError(err)) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errorType: err.errorType,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
  }

  // Handle Prisma errors
  if (err && typeof err === 'object' && 'code' in err) {
    const prismaError = err as { code: string };
    switch (prismaError.code) {
      case 'P2002':
        return res.status(HttpStatusCodes.FORBIDDEN).json({
          success: false,
          message: 'A record with this information already exists',
          errorType: ErrorTypes.UNIQUE_CONSTRAINT_ERROR,
        });
      case 'P2025':
        return res.status(HttpStatusCodes.NOT_FOUND).json({
          success: false,
          message: 'Record not found',
          errorType: ErrorTypes.NOT_FOUND_ERROR,
        });
      default:
        return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
          success: false,
          message: 'Database error occurred',
          errorType: ErrorTypes.DATABASE_ERROR,
        });
    }
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(HttpStatusCodes.FORBIDDEN).json({
      success: false,
      message: 'Invalid token',
      errorType: ErrorTypes.TOKEN_ERROR,
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(HttpStatusCodes.FORBIDDEN).json({
      success: false,
      message: 'Token expired',
      errorType: ErrorTypes.TOKEN_ERROR,
    });
  }

  // Handle validation errors
  if (err.name === 'ValidationError') {
    return res.status(HttpStatusCodes.BAD_REQUEST).json({
      success: false,
      message: err.message,
      errorType: ErrorTypes.VALIDATION_ERROR,
    });
  }

  // Default error response
  res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
    success: false,
    message: 'Internal server error',
    errorType: ErrorTypes.INTERNAL_ERROR,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

export const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export const notFoundHandler = (_req: Request, res: Response) => {
  res.status(HttpStatusCodes.NOT_FOUND).json({
    success: false,
    message: 'Route not found',
    errorType: ErrorTypes.NOT_FOUND_ERROR,
  });
};
