import { createAppError } from './AppError';
import { HttpStatusCodes } from './HttpStatusCodes';
import { ErrorTypes } from './ErrorTypes';

export const createNotFoundError = (message: string) =>
  createAppError(
    message,
    HttpStatusCodes.NOT_FOUND,
    ErrorTypes.NOT_FOUND_ERROR,
  );

export const createPermissionError = (message: string) =>
  createAppError(
    message,
    HttpStatusCodes.FORBIDDEN,
    ErrorTypes.PERMISSION_ERROR,
  );

export const createMessageNotFoundError = (message = 'Message not found') =>
  createAppError(
    message,
    HttpStatusCodes.NOT_FOUND,
    ErrorTypes.NOT_FOUND_ERROR,
  );

export const createCannotDeleteOthersMessagesError = (
  message = 'You can only delete your own messages',
) =>
  createAppError(
    message,
    HttpStatusCodes.FORBIDDEN,
    ErrorTypes.PERMISSION_ERROR,
  );

export const createCannotEditOthersMessagesError = (
  message = 'You can only edit your own messages',
) =>
  createAppError(
    message,
    HttpStatusCodes.FORBIDDEN,
    ErrorTypes.PERMISSION_ERROR,
  );

export const createUserNotParticipantError = (
  message = 'User is not a participant in this conversation',
) =>
  createAppError(
    message,
    HttpStatusCodes.FORBIDDEN,
    ErrorTypes.PERMISSION_ERROR,
  );

export const createConversationNotFoundError = (
  message = 'Conversation not found',
) =>
  createAppError(
    message,
    HttpStatusCodes.NOT_FOUND,
    ErrorTypes.NOT_FOUND_ERROR,
  );

export const createOnlyGroupConversationsCanBeUpdatedError = (
  message = 'Only group conversations can be updated',
) =>
  createAppError(
    message,
    HttpStatusCodes.BAD_REQUEST,
    ErrorTypes.BUSINESS_LOGIC_ERROR,
  );

export const createOnlyOwnerCanUpdateError = (
  message = 'Only the owner can update this conversation',
) =>
  createAppError(
    message,
    HttpStatusCodes.FORBIDDEN,
    ErrorTypes.PERMISSION_ERROR,
  );
