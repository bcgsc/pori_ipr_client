import React from 'react';
import ReactDOM from 'react-dom';
import { ThemeProvider, Theme, StyledEngineProvider } from '@mui/material/styles';

import ApiCall from './ApiCall';
import AlertDialog from '../../components/AlertDialog';
import { theme } from '../../App';

/**
 * Set of Api calls to be co-requested and co-aborted
 */
class ApiCallSet {
  private calls: ApiCall<any>[];

  constructor(calls = []) {
    this.calls = calls;
  }

  push<T>(call: ApiCall<T>): void {
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

  async request(confirm = false): Promise<any[]> {
    if (confirm) {
      this.showConfirm();
      return;
    }
    // eslint-disable-next-line consistent-return
    return Promise.all(this.calls.map((call) => call.request()));
  }
}

export default ApiCallSet;
