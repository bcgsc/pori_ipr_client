import getLocalToken from '../management/token';

export const therapeuticAdd = async (reportIdent, entry) => {
  const authToken = getLocalToken();
  if (!authToken) {
    return [];
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
};

export const therapeuticUpdate = async (reportIdent, entryIdent, entry) => {
  const authToken = getLocalToken();
  if (!authToken) {
    return [];
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
};
