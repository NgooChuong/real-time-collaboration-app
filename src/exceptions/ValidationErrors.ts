import { createAppError } from './AppError';
import { HttpStatusCodes } from './HttpStatusCodes';
import { ErrorTypes } from './ErrorTypes';

export const createValidationError = (message: string) =>
  createAppError(message, HttpStatusCodes.BAD_REQUEST, ErrorTypes.VALIDATION_ERROR);

export const createRequiredFieldError = (fieldName: string) =>
  createAppError(`${fieldName} is required`, HttpStatusCodes.BAD_REQUEST, ErrorTypes.REQUIRED_FIELD_ERROR);

export const createMessageRequiredError = (message = 'Must provide a message') =>
  createAppError(message, HttpStatusCodes.BAD_REQUEST, ErrorTypes.REQUIRED_FIELD_ERROR);

export const createMessageOrImageRequiredError = (message = 'Must provide a message or include an image') =>
  createAppError(message, HttpStatusCodes.BAD_REQUEST, ErrorTypes.REQUIRED_FIELD_ERROR);

export const createConversationIdRequiredError = (message = 'Must provide a conversationId') =>
  createAppError(message, HttpStatusCodes.BAD_REQUEST, ErrorTypes.REQUIRED_FIELD_ERROR);

export const createParticipantsRequiredError = (message = 'Must provide array of participants') =>
  createAppError(message, HttpStatusCodes.BAD_REQUEST, ErrorTypes.REQUIRED_FIELD_ERROR);
