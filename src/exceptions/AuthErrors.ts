import { createAppError } from './AppError';
import { HttpStatusCodes } from './HttpStatusCodes';
import { ErrorTypes } from './ErrorTypes';

export const createUnauthorizedError = (message = 'Unauthorized') =>
  createAppError(
    message,
    HttpStatusCodes.UNAUTHORIZED,
    ErrorTypes.AUTHENTICATION_ERROR,
  );

export const createForbiddenError = (message = 'Forbidden') =>
  createAppError(
    message,
    HttpStatusCodes.FORBIDDEN,
    ErrorTypes.AUTHORIZATION_ERROR,
  );

export const createInvalidTokenError = (message = 'Invalid token') =>
  createAppError(message, HttpStatusCodes.FORBIDDEN, ErrorTypes.TOKEN_ERROR);

export const createUserNotFoundError = (message = 'User not found') =>
  createAppError(
    message,
    HttpStatusCodes.NOT_FOUND,
    ErrorTypes.NOT_FOUND_ERROR,
  );

export const createIncorrectPasswordError = (message = 'Incorrect password') =>
  createAppError(
    message,
    HttpStatusCodes.BAD_REQUEST,
    ErrorTypes.AUTHENTICATION_ERROR,
  );

export const createUsernameAlreadyInUseError = (
  message = 'Username already in use',
) =>
  createAppError(
    message,
    HttpStatusCodes.FORBIDDEN,
    ErrorTypes.UNIQUE_CONSTRAINT_ERROR,
  );
