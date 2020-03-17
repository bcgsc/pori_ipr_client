import getLocalToken from '../management/token';

const kbAutocomplete = async (targetType, keyword) => {
  const authToken = getLocalToken();
  if (!authToken) {
    return [];
  }

  const options = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': authToken,
    },
  };

  const response = await fetch(
    `${CONFIG.ENDPOINTS.API}/graphkb/${targetType}?keyword=${keyword}`,
    options,
  );

  if (response.ok) {
    const { result } = await response.json();
    return result;
  }
};

export default kbAutocomplete;
