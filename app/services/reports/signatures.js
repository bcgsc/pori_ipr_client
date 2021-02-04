import errorHandler from '@/services/errors/errorHandler';

const getSignatures = async (reportIdent) => {
  const options = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  };

  const response = await fetch(
    `${window._env_.API_BASE_URL}/reports/${reportIdent}/signatures`,
    options,
  );

  if (response.ok) {
    return response.json();
  }
  return errorHandler(response);
};

const sign = async (reportIdent, role) => {
  const options = {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  };

  const response = await fetch(
    `${window._env_.API_BASE_URL}/reports/${reportIdent}/signatures/sign/${role}`,
    options,
  );

  if (response.ok) {
    return response.json();
  }
  return errorHandler(response);
};

const revokeSignature = async (reportIdent, role) => {
  const options = {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  };

  const response = await fetch(
    `${window._env_.API_BASE_URL}/reports/${reportIdent}/signatures/revoke/${role}`,
    options,
  );

  if (response.ok) {
    return response.json();
  }
  return errorHandler(response);
};

export {
  getSignatures,
  sign,
  revokeSignature,
};
