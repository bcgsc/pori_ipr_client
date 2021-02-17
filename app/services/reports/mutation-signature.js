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
    `${window._env_.API_BASE_URL}/reports/${reportIdent}/mutation-signatures`,
    options,
  );

  if (response.ok) {
    return response.json();
  }
  return errorHandler(response);
};

const updateMutationSignature = async (reportIdent, signatureIdent, newSignature) => {
  const options = {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(newSignature),
  };

  const response = await fetch(
    `${window._env_.API_BASE_URL}/reports/${reportIdent}/mutation-signatures/${signatureIdent}`,
    options,
  );

  if (response.ok) {
    return response.json();
  }
  return errorHandler(response);
};

export {
  getMutationSignatures,
  updateMutationSignature,
};
