import AlertDialog from '@/components/AlertDialog';
import ReportContext from '@/context/ReportContext';
import api from '@/services/api';
import React, { useCallback, useContext } from 'react';
import ReactDOM from 'react-dom';
import snackbar from '@/services/SnackbarUtils';

const textDict = {
  probe: 'Do you wish to remove Ready and Reviewer signatures?',
  pharmacogenomic: 'Do you wish to remove Ready and Reviewer signatures?',
  genomic: 'Do you wish to remove Author and Reviewer signatures?',
};

const useConfirmDialog = () => {
  const { report } = useContext(ReportContext);

  const showDialog = useCallback((calls) => {
    const callPromises = (Array.isArray(calls) ? calls : [calls]);

    const handleClose = async (removeSignatures: boolean) => {
      if (removeSignatures) {
        callPromises.push(api.put(`/reports/${report.ident}/signatures/revoke/author`, {}));
        callPromises.push(api.put(`/reports/${report.ident}/signatures/revoke/reviewer`, {}));

        try {
          await Promise.all(callPromises.map((promise) => promise.request()));
        } catch (e) {
          snackbar.error(`Error: ${e}`);
        }
      }

      ReactDOM.unmountComponentAtNode(document.getElementById('alert-dialog'));
    };

    const handleDeny = async () => {
      try {
        await Promise.all(callPromises.map((promise) => promise.request()));
      } catch (e) {
        snackbar.error(`Error: ${e}`);
      }

      window.location.reload();

      ReactDOM.unmountComponentAtNode(document.getElementById('alert-dialog'));
    };

    ReactDOM.render(
      <AlertDialog
        isOpen
        onClose={handleClose}
        onDeny={handleDeny}
        title="Confirm Action"
        text={textDict[report?.template.name]}
        denyText="No"
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
