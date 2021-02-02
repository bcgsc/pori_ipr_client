import errorHandler from '../errors/errorHandler';

export const therapeuticAdd = async (reportIdent, entry) => {
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(entry),
  };

  const response = await fetch(
    `${window._env_.API_BASE_URL}/reports/${reportIdent}/therapeutic-targets`,
    options,
  );

  if (response.ok) {
    return response.json();
  }
  return errorHandler(response);
};

export const therapeuticDelete = async (reportIdent, entryIdent) => {
  const options = {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  };

  const response = await fetch(
    `${window._env_.API_BASE_URL}/reports/${reportIdent}/therapeutic-targets/${entryIdent}`,
    options,
  );

  if (response.ok) { // Returns 204 with no content
    return true;
  }
  return errorHandler(response);
};


export const therapeuticUpdate = async (reportIdent, entryIdent, entry) => {
  const options = {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(entry),
  };

  const response = await fetch(
    `${window._env_.API_BASE_URL}/reports/${reportIdent}/therapeutic-targets/${entryIdent}`,
    options,
  );

  if (response.ok) {
    const { result } = await response.json();
    return result;
  }
  return errorHandler(response);
};

export const therapeuticUpdateTable = async (reportIdent, entry) => {
  const options = {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(entry),
  };

  const response = await fetch(
    `${window._env_.API_BASE_URL}/reports/${reportIdent}/therapeutic-targets`,
    options,
  );

  if (response.ok) {
    return entry; // the response returns "ok" not the updated content
  }
  return errorHandler(response);
};

export const therapeuticGet = async (reportIdent) => {
  const options = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  };

  const response = await fetch(
    `${window._env_.API_BASE_URL}/reports/${reportIdent}/therapeutic-targets`,
    options,
  );

  if (response.ok) {
    return response.json();
  }
  return errorHandler(response);
};
