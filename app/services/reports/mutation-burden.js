import errorHandler from '../errors/errorHandler';

const getMutationBurden = async (reportIdent) => {
  const options = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  };

  const response = await fetch(
    `${CONFIG.ENDPOINTS.API}/reports/${reportIdent}/mutation-burden`,
    options,
  );

  if (response.ok) {
    return response.json();
  }
  return errorHandler(response);
};

const updateMutationBurden = async (reportIdent, mutationBurden) => {
  const options = {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: mutationBurden,
  };

  const response = await fetch(
    `${CONFIG.ENDPOINTS.API}/reports/${reportIdent}/mutation-burden`,
    options,
  );

  if (response.ok) {
    return response.json();
  }
  return errorHandler(response);
};


export {
  getMutationBurden,
  updateMutationBurden,
};
