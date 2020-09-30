import {
  BadRequestError,
} from '../errors/errors';

import errorHandler from '../errors/errorHandler';

const {
  ENDPOINTS: { API },
} = CONFIG;

class ApiCall {
  endpoint: string;
  requestOptions: any;
  controller: any;
  forceListReturn: boolean;
  forceRecordReturn: boolean;
  name: string;

  constructor(
    endpoint: string,
    requestOptions: any,
    callOptions: { forceListReturn: boolean, forceRecordReturn: boolean, name: string },
  ) {
    const {
      forceListReturn = false,
      forceRecordReturn = false,
      name = null,
    } = callOptions || {};
    this.endpoint = endpoint;
    this.requestOptions = requestOptions;
    this.controller = null;
    this.forceListReturn = forceListReturn;
    this.forceRecordReturn = forceRecordReturn;
    this.name = name || endpoint;
  }

  /**
     * Cancel this fetch request
     */
  abort() {
    if (this.controller) {
      this.controller.abort();
      this.controller = null;
    }
  }

  isFinished() {
    return !this.controller;
  }

  /**
   * Makes the fetch request and awaits the response or error. Also handles the redirect to error
   * or login pages
   */
  async request(ignoreAbort = false) {
    this.controller = new AbortController();

    let response;

    try {
      response = await fetch(
        API + this.endpoint,
        {
          ...this.requestOptions,
          headers: {
            'Content-type': 'application/json',
          },
          signal: this.controller.signal,
        },
      );
    } catch (err) {
      if (err.name === 'AbortError' && ignoreAbort) {
        return null;
      }
      console.error(err);
      console.error('Fetch error. Re-trying Request with cache-busting');
      this.controller = new AbortController();

      try {
        response = await fetch(
          API + this.endpoint,
          {
            ...this.requestOptions,
            headers: {
              'Content-type': 'application/json',
            },
            signal: this.controller.signal,
            cache: 'reload',
          },
        );
      } catch (err2) {
        if (err2.name === 'AbortError' && ignoreAbort) {
          return null;
        }
        console.error(err2);
        throw err2;
      }
    }
    this.controller = null;

    if (response.status === 204) {
      return null;
    }

    if (response.ok) {
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
    return errorHandler(response);
  }
}

/**
 * Set of Api calls to be co-requested and co-aborted
 */
class ApiCallSet {
  calls: Array<any>;

  constructor(calls = []) {
    this.calls = calls;
  }

  push(call) {
    this.calls.push(call);
  }

  abort() {
    this.calls.forEach(controller => controller.abort());
  }

  async request() {
    return Promise.all(this.calls.map(call => async () => call.request()));
  }
}


export { ApiCall, ApiCallSet };