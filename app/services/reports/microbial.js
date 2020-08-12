import errorHandler from '@/services/errors/errorHandler';

const getMicrobial = async (reportIdent) => {
  const options = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  };

  const response = await fetch(
    `${CONFIG.ENDPOINTS.API}/reports/${reportIdent}/summary/microbial`,
    options,
  );

  if (response.ok) {
    return response.json();
  }
  return errorHandler(response);
};

export {
  getMicrobial,
};
