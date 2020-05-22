import getLocalToken from '../management/token';
import errorHandler from '../errors/errorHandler';
import { AuthenticationError } from '../errors/errors';

export default async () => {
  const authToken = getLocalToken();
  if (!authToken) {
    throw new AuthenticationError('missing authentication token');
  }

  const options = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json; charset=UTF-8',
      'X-Requested-With': 'XMLHttpRequest',
      'Authorization': authToken,
      'credentials': 'same-origin',
    },
  };

  const response = await fetch(
    `${CONFIG.ENDPOINTS.API}/export/germline-small-mutation-reports/batch/download?reviews=biofx,projects`,
    options,
  );

  if (response.ok) {
    const blob = response.blob();
    let filenameHeader = response.headers.get('Content-Disposition');
    if (!filenameHeader) {
      // throw new Error('unable to get excel file from server');
      filenameHeader = 'germline.xlxs';
    }

    return { filenameHeader, blob };
  }
  return errorHandler(response);
};
