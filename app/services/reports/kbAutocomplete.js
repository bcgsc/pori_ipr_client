import getLocalToken from '../management/token';

const kbAutocomplete = async (targetType, keyword) => {
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
    body: JSON.stringify({ keyword }),
  };

  const response = await fetch(
    `${CONFIG.ENDPOINTS.API}/graphkb/${targetType}`,
    options,
  );

  if (response.ok) {
    const { result } = await response.json();
    return result;
  }
};

export default kbAutocomplete;
