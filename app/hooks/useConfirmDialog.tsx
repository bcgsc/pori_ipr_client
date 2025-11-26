import AlertDialog from '@/components/AlertDialog';
import ReportContext from '@/context/ReportContext';
import React, { useCallback, useContext } from 'react';
import ReactDOM from 'react-dom';
import snackbar from '@/services/SnackbarUtils';
import { ApiCall, ApiCallSet } from '@/services/api';
import { CircularProgress, Dialog, DialogContent } from '@mui/material';
import { Box } from '@mui/system';

const textDict = {
  probe: 'Making this change will cause signatures to be removed. Do you want to proceed?',
  pharmacogenomic: 'Making this change will cause signatures to be removed. Do you want to proceed?',
  genomic: 'Making this change will cause the reviewer and analyst signatures to be removed. Do you want to proceed?',
  rapid: 'Making this change will cause the reviewer and analyst signatures to be removed. Do you want to proceed?',
};

const useConfirmDialog = () => {
  const { report } = useContext(ReportContext);

  const showDialog = useCallback((calls, waitForConfirmation = false, confirmText = 'Task completed, refreshing...') => {
    const callPromises = Array.isArray(calls) ? calls : [calls];

    const renderDialog = (handleClose: (removeSignatures: boolean) => void) => {
      ReactDOM.render(
        <AlertDialog
          isOpen
          onClose={handleClose}
          title="Confirm Action"
          text={textDict[report?.template.name]}
          confirmText="Yes"
          cancelText="Cancel"
        />,
        document.getElementById('alert-dialog'),
      );
    };

    const renderLoadingDialog = () => {
      ReactDOM.render(
        <Dialog open PaperProps={{ sx: { p: 2 } }}>
          <DialogContent>
            <Box display="flex" alignItems="center" justifyContent="center" p={2}>
              <CircularProgress />
            </Box>
          </DialogContent>
        </Dialog>,
        document.getElementById('alert-dialog'),
      );
    };

    if (!waitForConfirmation) {
      const handleClose = async (removeSignatures = false) => {
        ReactDOM.unmountComponentAtNode(document.getElementById('alert-dialog'));
        if (removeSignatures) {
          renderLoadingDialog();
          try {
            await Promise.all(callPromises.map((promise) => ((promise instanceof ApiCall || promise instanceof ApiCallSet) ? promise.request() : promise)));
            snackbar.success(confirmText);
            window.location.reload();
          } catch (e) {
            snackbar.error(`Error: ${e}`);
          } finally {
            ReactDOM.unmountComponentAtNode(document.getElementById('alert-dialog'));
          }
        }
      };

      renderDialog(handleClose);
      return;
    }

    // waitForConfirmation === true
    // eslint-disable-next-line consistent-return
    return new Promise<boolean>((resolve, reject) => {
      const handleClose = async (removeSignatures = false) => {
        ReactDOM.unmountComponentAtNode(document.getElementById('alert-dialog'));
        if (removeSignatures) {
          try {
            renderLoadingDialog();
            await Promise.all(callPromises.map((promise) => ((promise instanceof ApiCall || promise instanceof ApiCallSet) ? promise.request() : promise)));
            snackbar.success(confirmText);
            window.location.reload();
            resolve(true);
          } catch (e) {
            snackbar.error(`Error: ${e}`);
            reject(e);
          } finally {
            ReactDOM.unmountComponentAtNode(document.getElementById('alert-dialog'));
          }
        } else {
          resolve(false); // user cancelled
        }
      };

      renderDialog(handleClose);
    });
  }, [report?.template.name]);

  return {
    showConfirmDialog: showDialog,
  };
};

export default useConfirmDialog;
