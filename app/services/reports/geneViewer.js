import getLocalToken from '../management/token';
import errorHandler from '../errors/errorHandler';
import { AuthenticationError } from '../errors/errors';

const geneViewer = async (gene, reportIdent) => {
  const authToken = getLocalToken();
  if (!authToken) {
    return new AuthenticationError('missing authentication token');
  }

  const options = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': authToken,
    },
  };

  const response = await fetch(
    `${CONFIG.ENDPOINTS.API}/reports/${reportIdent}/gene-viewer/${gene}`,
    options,
  );

  if (response.ok) {
    return response.json();
  }
  return errorHandler(response);
};

export default geneViewer;
