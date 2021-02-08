import React from 'react';
import ReactDOM from 'react-dom';
import {
  MuiThemeProvider,
} from '@material-ui/core/styles';
import {
  BadRequestError,
} from '../errors/errors';

import AlertDialog from '../../components/AlertDialog';
import { theme } from '../../App';

import errorHandler from '../errors/errorHandler';
import SnackbarUtils from '../SnackbarUtils';

class ApiCall {
  endpoint: string;

  requestOptions: any;

  controller: any;

  forceListReturn: boolean;

  forceRecordReturn: boolean;

  name: string;

  confirm: boolean;

  constructor(
    endpoint: string,
    requestOptions: any,
    callOptions: {
      forceListReturn: boolean;
      forceRecordReturn: boolean;
      name: string;
      confirm: boolean
    },
  ) {
    const {
      forceListReturn,
      forceRecordReturn,
      name,
      confirm,
    } = callOptions || {};
    this.endpoint = endpoint;
    this.requestOptions = requestOptions;
    this.controller = null;
    this.forceListReturn = forceListReturn;
    this.forceRecordReturn = forceRecordReturn;
    this.name = name || endpoint;
    this.confirm = confirm || false;
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

  showConfirm() {
    const handleClose = async (isSaved) => {
      if (isSaved) {
        await fetch(
          window._env_.API_BASE_URL + this.endpoint,
          {
            ...this.requestOptions,
            headers: {
              'Content-type': 'application/json',
            },
            signal: this.controller.signal,
          },
        );
        location.reload();
      }
      ReactDOM.unmountComponentAtNode(document.getElementById('alert-dialog'));
    };

    ReactDOM.render(
      <MuiThemeProvider theme={theme}>
        <AlertDialog
          isOpen
          onClose={handleClose}
          title="Confirm Action"
          text="Editing this report will remove analyst signatures. Continue?"
          confirmText="OK"
          cancelText="cancel"
        />
      </MuiThemeProvider>,
      document.getElementById('alert-dialog'),
    );
  }

  /**
   * Makes the fetch request and awaits the response or error. Also handles the redirect to error
   * or login pages
   */
  async request(confirm = false, ignoreAbort = false) {
    this.controller = new AbortController();

    const { method } = this.requestOptions;
    if (window._env_.IS_DEMO && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method.toUpperCase())) {
      SnackbarUtils.warning('Write operations are disabled in DEMO mode. Changes will not submit');
      return null;
    }

    let response;

    if (confirm) {
      this.showConfirm();
      return null;
    }

    try {
      response = await fetch(
        window._env_.API_BASE_URL + this.endpoint,
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
          window._env_.API_BASE_URL + this.endpoint,
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

  showConfirm() {
    const handleClose = async (isSaved: boolean) => {
      if (isSaved) {
        const promises = this.calls.map(call => call.request());
        await Promise.all(promises);
        location.reload();
      }
      ReactDOM.unmountComponentAtNode(document.getElementById('alert-dialog'));
    };

    ReactDOM.render(
      <MuiThemeProvider theme={theme}>
        <AlertDialog
          isOpen
          onClose={handleClose}
          title="Confirm Action"
          text="Editing this report will remove analyst signatures. Continue?"
          confirmText="OK"
          cancelText="cancel"
        />
      </MuiThemeProvider>,
      document.getElementById('alert-dialog'),
    );
  }

  async request(confirm = false) {
    if (confirm) {
      this.showConfirm();
      return;
    }
    // eslint-disable-next-line consistent-return
    return Promise.all(this.calls.map(call => call.request()));
  }
}

export { ApiCall, ApiCallSet };
