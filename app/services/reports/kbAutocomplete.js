import getLocalToken from '../management/token';
import errorHandler from '../errors/errorHandler';
import { AuthenticationError } from '../errors/errors';

const kbAutocomplete = async (targetType, keyword) => {
  const authToken = getLocalToken();
  if (!authToken) {
    return new AuthenticationError('missing authentication token');
  }

  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': authToken,
    },
    body: JSON.stringify({ keyword }),
  };

  const response = await fetch(
    `${CONFIG.ENDPOINTS.API}/graphkb/${targetType}`,
    options,
  );

  if (response.ok) {
    const { result } = await response.json();
    return result;
  }
  return errorHandler(response);
};

export default kbAutocomplete;
