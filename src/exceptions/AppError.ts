import { HttpStatusCodes } from './HttpStatusCodes';
import { ErrorTypes } from './ErrorTypes';

export type AppError = {
  readonly message: string;
  readonly statusCode: HttpStatusCodes;
  readonly errorType: ErrorTypes;
  readonly stack?: string;
};

export const createAppError = (
  message: string,
  statusCode: HttpStatusCodes,
  errorType: ErrorTypes = ErrorTypes.INTERNAL_ERROR
): AppError => {
  const error = new Error(message);
  Error.captureStackTrace(error, createAppError);
  
  return {
    message,
    statusCode,
    errorType,
    stack: error.stack,
  };
};

export const isAppError = (error: unknown): error is AppError => {
  return (
    typeof error === 'object' &&
    error !== null &&
    'statusCode' in error &&
    'errorType' in error
  );
};
