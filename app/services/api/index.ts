import ApiCall from './ApiCall';
import ApiCallSet from './ApiCallSet';
import { CallOptionsType } from './types';

const get = <T>(
  endpoint: string,
  callOptions?: CallOptionsType,
): ApiCall<T> => {
  const requestOptions: RequestInit = {
    method: 'GET',
  };
  return new ApiCall<T>(endpoint, requestOptions, callOptions);
};

const post = <T>(
  endpoint: string,
  payload: BodyInit | Record<string, unknown>,
  callOptions?: CallOptionsType,
  formData?: boolean,
): ApiCall<T> => {
  const requestOptions: RequestInit = {
    method: 'POST',
    body: formData ? payload as BodyInit : JSON.stringify(payload),
  };
  if (!formData) {
    requestOptions.headers = {
      'Content-type': 'application/json',
    };
  }
  return new ApiCall<T>(endpoint, requestOptions, callOptions);
};

const del = <T>(
  endpoint: string,
  payload: BodyInit | Record<string, unknown>,
  callOptions?: CallOptionsType,
  formData?: boolean,
): ApiCall<T> => {
  let requestOptions: RequestInit;

  if (payload) {
    requestOptions = {
      method: 'DELETE',
      body: formData ? payload as BodyInit : JSON.stringify(payload),
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
  return new ApiCall<T>(endpoint, requestOptions, callOptions);
};

const put = <T>(
  endpoint: string,
  payload: BodyInit | Record<string, unknown>,
  callOptions?: CallOptionsType,
  formData?: boolean,
): ApiCall<T> => {
  const requestOptions: RequestInit = {
    method: 'PUT',
    body: formData ? payload as BodyInit : JSON.stringify(payload),
  };
  if (!formData) {
    requestOptions.headers = {
      'Content-type': 'application/json',
    };
  }
  return new ApiCall<T>(endpoint, requestOptions, callOptions);
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
