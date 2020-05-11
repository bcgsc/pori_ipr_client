import getLocalToken from '../management/token';

const getErrorMessage = async (response) => {
  try {
    const message = await response.json();
    if (message.error) {
      if (message.error.message) {
        return message.error.message;
      }
      return message.error;
    }
    return JSON.stringify(message);
  } catch (err) {
    return JSON.stringify(response);
  }
};

export const therapeuticAdd = async (reportIdent, entry) => {
  const authToken = getLocalToken();
  if (!authToken) {
    throw new Error(`missing auth token to create therapeutic option for report (${reportIdent})`);
  }

  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': authToken,
    },
    body: JSON.stringify(entry),
  };

  const response = await fetch(
    `${CONFIG.ENDPOINTS.API}/reports/${reportIdent}/therapeutic-targets`,
    options,
  );

  if (response.ok) {
    return response.json();
  }
  const message = await getErrorMessage(response);
  throw new Error(`failed to create therapeutic option for report (${reportIdent}): ${message}`);
};

export const therapeuticDelete = async (reportIdent, entryIdent) => {
  const authToken = getLocalToken();
  if (!authToken) {
    throw new Error(`missing auth token to delete therapeutic option (${entryIdent}) for report (${reportIdent})`);
  }

  const options = {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': authToken,
    },
  };

  const response = await fetch(
    `${CONFIG.ENDPOINTS.API}/reports/${reportIdent}/therapeutic-targets/${entryIdent}`,
    options,
  );

  if (response.ok) {
    const { result } = await response.json();
    return result;
  }
  const message = await getErrorMessage(response);
  throw new Error(`failed delete therapeutic option (${entryIdent}) for report (${reportIdent}): ${message}`);
};


export const therapeuticUpdate = async (reportIdent, entryIdent, entry) => {
  const authToken = getLocalToken();
  if (!authToken) {
    throw new Error(`missing auth token to update therapeutic option (${entryIdent}) for report (${reportIdent})`);
  }

  const options = {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': authToken,
    },
    body: JSON.stringify(entry),
  };

  const response = await fetch(
    `${CONFIG.ENDPOINTS.API}/reports/${reportIdent}/therapeutic-targets/${entryIdent}`,
    options,
  );

  if (response.ok) {
    const { result } = await response.json();
    return result;
  }
  const message = await getErrorMessage(response);
  throw new Error(`failed update to therapeutic option (${entryIdent}) for report (${reportIdent}): ${message}`);
};

export const therapeuticUpdateTable = async (reportIdent, entry) => {
  const authToken = getLocalToken();
  if (!authToken) {
    throw new Error(`missing auth token to update therapeutic options for report (${reportIdent})`);
  }

  const options = {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': authToken,
    },
    body: JSON.stringify(entry),
  };

  const response = await fetch(
    `${CONFIG.ENDPOINTS.API}/reports/${reportIdent}/therapeutic-targets`,
    options,
  );

  if (response.ok) {
    const { result } = await response.json(); // this returns "ok" not the updated content
    return entry;
  }

  throw new Error(`${response.status} ${response.statusText}`);
};
