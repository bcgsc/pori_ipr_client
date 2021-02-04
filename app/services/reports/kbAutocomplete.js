import errorHandler from '../errors/errorHandler';

const kbAutocomplete = async (targetType, keyword) => {
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({ keyword }),
  };

  const response = await fetch(
    `${window._env_.API_BASE_URL}/graphkb/${targetType}`,
    options,
  );

  if (response.ok) {
    const { result } = await response.json();
    return result;
  }
  return errorHandler(response);
};

export default kbAutocomplete;
