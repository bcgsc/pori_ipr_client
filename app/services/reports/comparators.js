import errorHandler from '../errors/errorHandler';

const getComparators = async (reportIdent) => {
  const options = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  };

  const response = await fetch(
    `${CONFIG.ENDPOINTS.API}/reports/${reportIdent}/comparators`,
    options,
  );

  if (response.ok) {
    return response.json();
  }
  return errorHandler(response);
};

export {
  getComparators,
};
