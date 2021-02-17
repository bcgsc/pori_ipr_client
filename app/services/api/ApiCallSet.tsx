import React from 'react';
import ReactDOM from 'react-dom';
import {
  MuiThemeProvider,
} from '@material-ui/core/styles';
import AlertDialog from '../../components/AlertDialog';
import { theme } from '../../App';

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
    this.calls.forEach((controller) => controller.abort());
  }

  showConfirm() {
    const handleClose = async (isSaved: boolean) => {
      if (isSaved) {
        const promises = this.calls.map((call) => call.request());
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
    return Promise.all(this.calls.map((call) => call.request()));
  }
}

export default ApiCallSet;
