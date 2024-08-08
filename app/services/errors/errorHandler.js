import {
  AuthenticationError,
  AuthorizationError,
  BadRequestError,
  APIConnectionFailureError,
  RecordConflictError,
} from './errors';

const errorHandler = async (response) => {
  const { status, statusText, url } = response;
  const error = {
    message: response.statusText,
    ...(await response.json()),
    status,
    url,
  };

  if (status === 401) {
    throw new AuthenticationError(error);
  }
  if (status === 400) {
    throw new BadRequestError(error);
  }
  if (status === 403) {
    throw new AuthorizationError(error);
  }
  if (status === 404) {
    throw new APIConnectionFailureError(error);
  }
  if (status === 409) {
    throw new RecordConflictError(error);
  }
  throw new Error(`Unexpected Error [${status}]: ${statusText}`);
};

export default errorHandler;
