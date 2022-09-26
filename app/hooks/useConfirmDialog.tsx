import AlertDialog from '@/components/AlertDialog';
import ReportContext from '@/context/ReportContext';
import React, { useCallback, useContext } from 'react';
import ReactDOM from 'react-dom';

const useConfirmDialog = () => {
  const { report } = useContext(ReportContext);

  const showDialog = useCallback((calls) => {
    const callPromises = (Array.isArray(calls) ? calls : [calls]).map((call) => call.request());

    const handleClose = async (removeSignatures: boolean) => {
      console.log('🚀 ~ file: useConfirmDialog.tsx ~ line 8 ~ useConfirmDialog ~ report', report);

      if (removeSignatures) {
        console.log('yes remove sigs do your shit');
        // Remove the signatures
      }
      try {
        const res = await Promise.all(callPromises);
      } catch (e) {

      }

      console.log('🚀 ~ file: useConfirmDialog.tsx ~ line 18 ~ handleClose ~ res', res);
      ReactDOM.unmountComponentAtNode(document.getElementById('alert-dialog'));
    };

    const handleDeny = async () => {
      console.log('denied');
      const res = await Promise.all(callPromises);
      console.log('handleDeny', res);
    };

    ReactDOM.render(
      <AlertDialog
        isOpen
        onClose={handleClose}
        onDeny={handleDeny}
        title="Confirm Action"
        text="Do you wish to remove analyst and reviewer signatures as well?"
        denyText="No"
        confirmText="OK"
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
