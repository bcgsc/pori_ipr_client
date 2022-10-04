import React from 'react';
import ReactDOM from 'react-dom';
import { ThemeProvider, StyledEngineProvider } from '@mui/material/styles';

import {
  BadRequestError,
} from '../errors/errors';
import AlertDialog from '../../components/AlertDialog';
import theme from '../../appTheme';
import errorHandler from '../errors/errorHandler';
import SnackbarUtils from '../SnackbarUtils';
import { CallOptionsType } from './types';

class ApiCall {
  endpoint: string;

  requestOptions: RequestInit;

  controller: AbortController;

  forceListReturn: boolean;

  forceRecordReturn: boolean;

  raw: boolean;

  name: string;

  confirm: boolean;

  constructor(
    endpoint: string,
    requestOptions: RequestInit,
    callOptions: CallOptionsType,
  ) {
    const {
      forceListReturn,
      forceRecordReturn,
      raw,
      name,
      confirm,
    } = callOptions || {};
    this.endpoint = endpoint;
    this.requestOptions = requestOptions;
    this.controller = null;
    this.forceListReturn = forceListReturn;
    this.forceRecordReturn = forceRecordReturn;
    this.raw = raw || false;
    this.name = name || endpoint;
    this.confirm = confirm || false;
  }

  /**
     * Cancel this fetch request
     */
  abort(): void {
    if (this.controller) {
      this.controller.abort();
      this.controller = null;
    }
  }

  isFinished(): boolean {
    return !this.controller;
  }

  /**
   * Makes the fetch request and awaits the response or error. Also handles the redirect to error
   * or login pages
   */
  async request() {
    this.controller = new AbortController();

    const { method } = this.requestOptions;
    if (window._env_.IS_DEMO && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method.toUpperCase())) {
      SnackbarUtils.warning('Write operations are disabled in DEMO mode. Changes will not submit');
      return null;
    }

    let response;

    try {
      response = await fetch(
        window._env_.API_BASE_URL + this.endpoint,
        {
          ...this.requestOptions,
          signal: this.controller.signal,
        },
      );
    } catch (err) {
      console.error(err);
      console.error('Fetch error. Re-trying Request with cache-busting');
      this.controller = new AbortController();

      try {
        response = await fetch(
          window._env_.API_BASE_URL + this.endpoint,
          {
            ...this.requestOptions,
            signal: this.controller.signal,
            cache: 'reload',
          },
        );
      } catch (err2) {
        console.error(err2);
        throw err2;
      }
    }
    this.controller = null;

    if (response.status === 204) {
      return null;
    }

    if (response.ok && !this.raw) {
      let result = await response.json();

      if (this.forceListReturn && !Array.isArray(result)) {
        result = [result];
      } else if (Array.isArray(result) && this.forceRecordReturn) {
        if (result.length > 1) {
          throw new BadRequestError(`expected a single record but found multiple (${result.length})`);
        }
        [result] = result;
      }
      return result;
    }
    if (this.raw) {
      return response;
    }

    return errorHandler(response);
  }
}

export { ApiCall };
export type { ApiCall as ApiCallType };
