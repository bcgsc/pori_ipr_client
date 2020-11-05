import { ApiCall, ApiCallSet } from './api';

const get = (endpoint, callOptions) => {
  const requestOptions = {
    method: 'GET',
  };
  return new ApiCall(endpoint, requestOptions, callOptions);
};

const post = (endpoint, payload, callOptions) => {
  const requestOptions = {
    method: 'POST',
    body: JSON.stringify(payload),
  };
  return new ApiCall(endpoint, requestOptions, callOptions);
};

const del = (endpoint, payload, callOptions) => {
  let requestOptions;

  if (payload) {
    requestOptions = {
      method: 'DELETE',
      body: JSON.stringify(payload),
    };
  } else {
    requestOptions = {
      method: 'DELETE',
    };
  }
  return new ApiCall(endpoint, requestOptions, callOptions);
};

const put = (endpoint, payload, callOptions) => {
  const requestOptions = {
    method: 'PUT',
    body: JSON.stringify(payload),
  };
  return new ApiCall(endpoint, requestOptions, callOptions);
};

export default {
  get,
  post,
  del,
  put,
};

export {
  ApiCall,
  ApiCallSet,
};
