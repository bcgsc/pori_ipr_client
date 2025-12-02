import { ApiCall } from './ApiCall';
import { CallOptionsType } from './types';

type ApiCallPayload = BodyInit | Record<string, unknown>;

const get = (
  endpoint: string,
  callOptions?: CallOptionsType,
): ApiCall => {
  const requestOptions: RequestInit = {
    method: 'GET',
  };
  return new ApiCall(endpoint, requestOptions, callOptions);
};

const post = (
  endpoint: string,
  payload: ApiCallPayload,
  callOptions?: CallOptionsType,
  formData?: boolean,
): ApiCall => {
  const requestOptions: RequestInit = {
    method: 'POST',
    body: formData ? payload as BodyInit : JSON.stringify(payload),
  };
  if (!formData) {
    requestOptions.headers = {
      'Content-type': 'application/json',
    };
  }
  return new ApiCall(endpoint, requestOptions, callOptions);
};

const del = (
  endpoint: string,
  payload: ApiCallPayload,
  callOptions?: CallOptionsType,
  formData?: boolean,
): ApiCall => {
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
  return new ApiCall(endpoint, requestOptions, callOptions);
};

const put = (
  endpoint: string,
  payload: ApiCallPayload,
  callOptions?: CallOptionsType,
  formData?: boolean,
): ApiCall => {
  const requestOptions: RequestInit = {
    method: 'PUT',
    body: formData ? payload as BodyInit : JSON.stringify(payload),
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

export { ApiCall };
export { default as ApiCallSet } from './ApiCallSet';
export type {
  ApiCallPayload,
};
