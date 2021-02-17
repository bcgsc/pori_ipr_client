import ApiCall from './ApiCall';
import ApiCallSet from './ApiCallSet';

const get = (endpoint, callOptions) => {
  const requestOptions = {
    method: 'GET',
  };
  return new ApiCall(endpoint, requestOptions, callOptions);
};

const post = (endpoint, payload, callOptions, formData = false) => {
  const requestOptions = {
    method: 'POST',
    body: formData ? payload : JSON.stringify(payload),
  };
  if (!formData) {
    requestOptions.headers = {
      'Content-type': 'application/json',
    };
  }
  return new ApiCall(endpoint, requestOptions, callOptions);
};

const del = (endpoint, payload, callOptions, formData = false) => {
  let requestOptions;

  if (payload) {
    requestOptions = {
      method: 'DELETE',
      body: formData ? payload : JSON.stringify(payload),
    };
  } else {
    requestOptions = {
      method: 'DELETE',
    };
  }
  if (!formData) {
    requestOptions.headers = {
      'Content-type': 'application/json',
    };
  }
  return new ApiCall(endpoint, requestOptions, callOptions);
};

const put = (endpoint, payload, callOptions, formData = false) => {
  const requestOptions = {
    method: 'PUT',
    body: formData ? payload : JSON.stringify(payload),
  };
  if (!formData) {
    requestOptions.headers = {
      'Content-type': 'application/json',
    };
  }
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
