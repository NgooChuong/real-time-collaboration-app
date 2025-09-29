import { createAppError } from './AppError';
import { HttpStatusCodes } from './HttpStatusCodes';
import { ErrorTypes } from './ErrorTypes';

export const createInternalServerError = (message = 'Internal server error') =>
  createAppError(message, HttpStatusCodes.INTERNAL_SERVER_ERROR, ErrorTypes.INTERNAL_ERROR);

export const createDatabaseError = (message = 'Database operation failed') =>
  createAppError(message, HttpStatusCodes.INTERNAL_SERVER_ERROR, ErrorTypes.DATABASE_ERROR);

export const createRedisError = (message = 'Redis operation failed') =>
  createAppError(message, HttpStatusCodes.INTERNAL_SERVER_ERROR, ErrorTypes.REDIS_ERROR);

export const createExternalServiceError = (serviceName: string, message = 'External service error') =>
  createAppError(`${serviceName}: ${message}`, HttpStatusCodes.INTERNAL_SERVER_ERROR, ErrorTypes.EXTERNAL_SERVICE_ERROR);
