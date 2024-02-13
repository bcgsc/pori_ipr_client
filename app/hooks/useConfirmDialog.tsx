import AlertDialog from '@/components/AlertDialog';
import ReportContext from '@/context/ReportContext';
import React, { useCallback, useContext } from 'react';
import ReactDOM from 'react-dom';
import snackbar from '@/services/SnackbarUtils';

const textDict = {
  probe: 'Making this change will cause signatures to be removed. Do you want to proceed?',
  pharmacogenomic: 'Making this change will cause signatures to be removed. Do you want to proceed?',
  genomic: 'Making this change will cause the reviewer and analyst signatures to be removed. Do you want to proceed?',
  rapid: 'Making this change will cause the reviewer and analyst signatures to be removed. Do you want to proceed?',
};

const useConfirmDialog = () => {
  const { report } = useContext(ReportContext);

  const showDialog = useCallback((calls) => {
    const callPromises = (Array.isArray(calls) ? calls : [calls]);

    const handleClose = async (removeSignatures: boolean = false) => {
      if (removeSignatures) {
        try {
          await Promise.all(callPromises.map((promise) => promise.request()));
          window.location.reload();
        } catch (e) {
          snackbar.error(`Error: ${e}`);
        } finally {
          ReactDOM.unmountComponentAtNode(document.getElementById('alert-dialog'));
        }
      }
      ReactDOM.unmountComponentAtNode(document.getElementById('alert-dialog'));
    };

    ReactDOM.render(
      <AlertDialog
        isOpen
        onClose={handleClose}
        title="Confirm Action"
        text={textDict[report?.template.name]}
        confirmText="Yes"
        cancelText="cancel"
      />,
      document.getElementById('alert-dialog'),
    );
  }, [report]);

  return {
    showConfirmDialog: showDialog,
  };
};

export default useConfirmDialog;
