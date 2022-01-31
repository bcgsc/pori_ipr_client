import React from 'react';
import ReactDOM from 'react-dom';
import { ThemeProvider, StyledEngineProvider } from '@mui/material/styles';

import ApiCall from './ApiCall';
import AlertDialog from '../../components/AlertDialog';
import { theme } from '../../theme';
import { RequestReturnType } from './types';

/**
 * Set of Api calls to be co-requested and co-aborted
 */
class ApiCallSet {
  calls: ApiCall[];

  constructor(calls = []) {
    this.calls = calls;
  }

  push(call: ApiCall): void {
    this.calls.push(call);
  }

  abort(): void {
    this.calls.forEach((controller) => controller.abort());
  }

  showConfirm(): void {
    const handleClose = async (isSaved: boolean) => {
      if (isSaved) {
        const promises = this.calls.map((call) => call.request());
        await Promise.all(promises);
        location.reload();
      }
      ReactDOM.unmountComponentAtNode(document.getElementById('alert-dialog'));
    };

    ReactDOM.render(
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={theme}>
          <AlertDialog
            isOpen
            onClose={handleClose}
            title="Confirm Action"
            text="Editing this report will remove analyst signatures. Continue?"
            confirmText="OK"
            cancelText="cancel"
          />
        </ThemeProvider>
      </StyledEngineProvider>,
      document.getElementById('alert-dialog'),
    );
  }

  async request(confirm = false): Promise<RequestReturnType[] | void> {
    if (confirm) {
      this.showConfirm();
      return;
    }
    // eslint-disable-next-line consistent-return
    return Promise.all(this.calls.map((call) => call.request()));
  }
}

export default ApiCallSet;
