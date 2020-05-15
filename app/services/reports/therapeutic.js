import getLocalToken from '../management/token';
import errorHandler from '../errors/errorHandler';
import { AuthenticationError } from '../errors/errors';

export const therapeuticAdd = async (reportIdent, entry) => {
  const authToken = getLocalToken();
  if (!authToken) {
    throw new AuthenticationError('missing authentication token');
  }

  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': authToken,
    },
    body: JSON.stringify(entry),
  };

  const response = await fetch(
    `${CONFIG.ENDPOINTS.API}/reports/${reportIdent}/therapeutic-targets`,
    options,
  );

  if (response.ok) {
    return response.json();
  }
  return errorHandler(response);
};

export const therapeuticDelete = async (reportIdent, entryIdent) => {
  const authToken = getLocalToken();
  if (!authToken) {
    throw new AuthenticationError('missing authentication token');
  }

  const options = {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': authToken,
    },
  };

  const response = await fetch(
    `${CONFIG.ENDPOINTS.API}/reports/${reportIdent}/therapeutic-targets/${entryIdent}`,
    options,
  );

  if (response.ok) {
    const { result } = await response.json();
    return result;
  }
  return errorHandler(response);
};


export const therapeuticUpdate = async (reportIdent, entryIdent, entry) => {
  const authToken = getLocalToken();
  if (!authToken) {
    throw new AuthenticationError('missing authentication token');
  }

  const options = {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': authToken,
    },
    body: JSON.stringify(entry),
  };

  const response = await fetch(
    `${CONFIG.ENDPOINTS.API}/reports/${reportIdent}/therapeutic-targets/${entryIdent}`,
    options,
  );

  if (response.ok) {
    const { result } = await response.json();
    return result;
  }
  return errorHandler(response);
};

export const therapeuticUpdateTable = async (reportIdent, entry) => {
  const authToken = getLocalToken();
  if (!authToken) {
    throw new AuthenticationError('missing authentication token');
  }

  const options = {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': authToken,
    },
    body: JSON.stringify(entry),
  };

  const response = await fetch(
    `${CONFIG.ENDPOINTS.API}/reports/${reportIdent}/therapeutic-targets`,
    options,
  );

  if (response.ok) {
    return entry; // the response returns "ok" not the updated content
  }
  return errorHandler(response);
};
