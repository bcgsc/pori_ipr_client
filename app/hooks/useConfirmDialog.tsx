import AlertDialog from '@/components/AlertDialog';
import ReportContext from '@/context/ReportContext';
import ConfirmContext from '@/context/ConfirmContext';
import React, { useCallback, useContext } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { useQueryClient } from 'react-query';
import snackbar from '@/services/SnackbarUtils';
import { ApiCall, ApiCallSet } from '@/services/api';
import { queryKeys } from '@/queries/queryKeys';
import { CircularProgress, Dialog, DialogContent } from '@mui/material';
import { Box } from '@mui/system';

const textDict = {
  probe: 'Making this change will cause signatures to be removed. Do you want to proceed?',
  pharmacogenomic: 'Making this change will cause signatures to be removed. Do you want to proceed?',
  genomic: 'Making this change will cause the reviewer and analyst signatures to be removed. Do you want to proceed?',
  rapid: 'Making this change will cause the reviewer and analyst signatures to be removed. Do you want to proceed?',
};

// The #alert-dialog node is a single app-wide container, so a single persistent
// root is reused across opens. createRoot must not be called twice on the same
// container without unmounting first, hence the module-level handle.
let dialogRoot: Root | null = null;

const renderInDialog = (element: JSX.Element) => {
  const container = document.getElementById('alert-dialog');
  if (!container) { return; }
  if (!dialogRoot) {
    dialogRoot = createRoot(container);
  }
  dialogRoot.render(element);
};

const closeDialog = () => {
  if (dialogRoot) {
    dialogRoot.unmount();
    dialogRoot = null;
  }
};

/**
 * Confirms a signature-removing action, then runs the given API call(s).
 *
 * `showConfirmDialog(calls, waitForConfirmation?, confirmText?)`
 *  - `calls`: an ApiCall/ApiCallSet (or array) to run if the user confirms.
 *  - `waitForConfirmation = false` (fire-and-forget): on confirm the hook runs
 *    the calls and does a full `window.location.reload()`. Returns nothing.
 *  - `waitForConfirmation = true` (awaitable): returns `Promise<boolean>` —
 *    resolves `true` after the calls succeed, `false` if cancelled, rejects on
 *    error. No page reload; instead the hook invalidates the report-signatures
 *    query and resets the `isSigned` flag (the signature state the reload used
 *    to clear). The caller is responsible for refreshing its own mutated data.
 *  - `confirmText`: success snackbar message.
 */
const useConfirmDialog = () => {
  const { report } = useContext(ReportContext);
  const { setIsSigned } = useContext(ConfirmContext);
  const queryClient = useQueryClient();

  const showDialog = useCallback((calls, waitForConfirmation = false, confirmText = 'Task completed, refreshing...') => {
    const callPromises = Array.isArray(calls) ? calls : [calls];

    const renderDialog = (handleClose: (removeSignatures: boolean) => void) => {
      renderInDialog(
        <AlertDialog
          isOpen
          onClose={handleClose}
          title="Confirm Action"
          text={textDict[report?.template.name]}
          confirmText="Yes"
          cancelText="Cancel"
        />,
      );
    };

    const renderLoadingDialog = () => {
      renderInDialog(
        <Dialog open PaperProps={{ sx: { p: 2 } }}>
          <DialogContent>
            <Box display="flex" alignItems="center" justifyContent="center" p={2}>
              <CircularProgress />
            </Box>
          </DialogContent>
        </Dialog>,
      );
    };

    if (!waitForConfirmation) {
      const handleClose = async (removeSignatures = false) => {
        if (removeSignatures) {
          renderLoadingDialog();
          try {
            await Promise.all(callPromises.map((promise) => ((promise instanceof ApiCall || promise instanceof ApiCallSet) ? promise.request() : promise)));
            snackbar.success(confirmText);
            window.location.reload();
          } catch (e) {
            snackbar.error(`Error: ${e}`);
          } finally {
            closeDialog();
          }
        } else {
          closeDialog();
        }
      };

      renderDialog(handleClose);
      return;
    }

    // waitForConfirmation === true
    // eslint-disable-next-line consistent-return
    return new Promise<boolean>((resolve, reject) => {
      const handleClose = async (removeSignatures = false) => {
        if (removeSignatures) {
          try {
            renderLoadingDialog();
            await Promise.all(callPromises.map((promise) => ((promise instanceof ApiCall || promise instanceof ApiCallSet) ? promise.request() : promise)));
            snackbar.success(confirmText);
            // No reload: explicitly clear the signature state the reload used
            // to wipe, so the caller can refresh its own data in place.
            if (report?.ident) {
              await queryClient.invalidateQueries(queryKeys.reports.reportSignatures(report.ident));
            }
            setIsSigned(false);
            resolve(true);
          } catch (e) {
            snackbar.error(`Error: ${e}`);
            reject(e);
          } finally {
            closeDialog();
          }
        } else {
          closeDialog();
          resolve(false); // user cancelled
        }
      };

      renderDialog(handleClose);
    });
  }, [report?.template.name, report?.ident, queryClient, setIsSigned]);

  return {
    showConfirmDialog: showDialog,
  };
};

export default useConfirmDialog;
