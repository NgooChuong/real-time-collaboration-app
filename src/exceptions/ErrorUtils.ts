import { AppError, createAppError } from './AppError';
import { HttpStatusCodes } from './HttpStatusCodes';
import { ErrorTypes } from './ErrorTypes';

export const createErrorResponse = (error: AppError) => ({
  success: false,
  message: error.message,
  errorType: error.errorType,
  statusCode: error.statusCode,
  ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
});

export const createSuccessResponse = <T>(data: T, message?: string) => ({
  success: true,
  data,
  ...(message && { message }),
});

export const throwIf = (condition: boolean, error: AppError): void => {
  if (condition) throw error;
};

export const throwIfNull = <T>(value: T | null | undefined, error: AppError): T => {
  if (value === null || value === undefined) throw error;
  return value;
};

export const createMissingFieldError = (fieldName: string) =>
  createAppError(`${fieldName} is required`, HttpStatusCodes.BAD_REQUEST, ErrorTypes.REQUIRED_FIELD_ERROR);

export const createInvalidFieldError = (fieldName: string, reason?: string) =>
  createAppError(`Invalid ${fieldName}${reason ? `: ${reason}` : ''}`, HttpStatusCodes.BAD_REQUEST, ErrorTypes.VALIDATION_ERROR);

export const createInsufficientPermissionError = (action: string) =>
  createAppError(`Insufficient permissions to ${action}`, HttpStatusCodes.FORBIDDEN, ErrorTypes.PERMISSION_ERROR);

export const createResourceNotFoundError = (resourceType: string, identifier?: string) =>
  createAppError(`${resourceType}${identifier ? ` with ${identifier}` : ''} not found`, HttpStatusCodes.NOT_FOUND, ErrorTypes.NOT_FOUND_ERROR);

export const safeAsync = async <T>(
  operation: () => Promise<T>,
  errorHandler?: (error: unknown) => AppError
): Promise<T | AppError> => {
  try {
    return await operation();
  } catch (error) {
    if (errorHandler) return errorHandler(error);
    return createAppError('An unexpected error occurred', HttpStatusCodes.INTERNAL_SERVER_ERROR, ErrorTypes.INTERNAL_ERROR);
  }
};
