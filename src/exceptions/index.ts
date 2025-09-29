// Core
export { AppError, createAppError, isAppError } from './AppError';
export { HttpStatusCodes } from './HttpStatusCodes';
export { ErrorTypes } from './ErrorTypes';

// Error creators
export {
  createUnauthorizedError,
  createForbiddenError,
  createInvalidTokenError,
  createUserNotFoundError,
  createIncorrectPasswordError,
  createUsernameAlreadyInUseError,
} from './AuthErrors';

export {
  createValidationError,
  createRequiredFieldError,
  createMessageRequiredError,
  createMessageOrImageRequiredError,
  createConversationIdRequiredError,
  createParticipantsRequiredError,
} from './ValidationErrors';

export {
  createNotFoundError,
  createPermissionError,
  createMessageNotFoundError,
  createCannotDeleteOthersMessagesError,
  createCannotEditOthersMessagesError,
  createUserNotParticipantError,
  createConversationNotFoundError,
  createOnlyGroupConversationsCanBeUpdatedError,
  createOnlyOwnerCanUpdateError,
} from './BusinessErrors';

export {
  createInternalServerError,
  createDatabaseError,
  createRedisError,
  createExternalServiceError,
} from './ServerErrors';

// Utilities
export {
  globalErrorHandler,
  asyncHandler,
  notFoundHandler,
} from './ErrorHandler';

export {
  createErrorResponse,
  createSuccessResponse,
  throwIf,
  throwIfNull,
  createMissingFieldError,
  createInvalidFieldError,
  createInsufficientPermissionError,
  createResourceNotFoundError,
  safeAsync,
} from './ErrorUtils';
