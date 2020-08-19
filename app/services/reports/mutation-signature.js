import errorHandler from '../errors/errorHandler';

const getMutationSignatures = async (reportIdent) => {
  const options = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  };

  const response = await fetch(
    `${CONFIG.ENDPOINTS.API}/reports/${reportIdent}/mutation-signatures`,
    options,
  );

  if (response.ok) {
    return response.json();
  }
  return errorHandler(response);
};

export {
  getMutationSignatures,
};
