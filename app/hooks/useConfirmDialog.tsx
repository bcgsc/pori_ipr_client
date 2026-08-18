import AlertDialog from '@/components/AlertDialog';
import ReportContext from '@/context/ReportContext';
import React, { useCallback, useContext } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { useQueryClient } from 'react-query';
import snackbar from '@/services/SnackbarUtils';
import { ApiCall, ApiCallSet } from '@/services/api';
import { queryKeys } from '@/queries/queryKeys';
import reloadWindow from '@/utils/reloadWindow';
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
 * Whether a supplied call can be held back until the user confirms.
 *
 * Only these three forms can: `ApiCall` / `ApiCallSet` are inert until
 * `.request()`, and a function is inert until invoked. An already-created promise
 * is not accepted — it starts running the moment it is constructed, so there is
 * no way to gate it behind the dialog; wrap that work in a function instead.
 */
const isDeferrable = (call) => typeof call === 'function'
  || call instanceof ApiCall
  || call instanceof ApiCallSet;

/**
 * Starts a single call, at confirm time rather than at call-construction time.
 *
 * Invoking a function here is what lets a caller express a chain whose later
 * calls depend on an earlier call's response — an `ApiCallSet` cannot, since it
 * runs its calls through `Promise.all`.
 */
const startCall = (call) => (typeof call === 'function' ? call() : call.request());

/**
 * React hook for confirming an action that removes the report's signatures
 * before running it.
 *
 * Renders a confirmation `AlertDialog` into the app-wide `#alert-dialog`
 * container. The dialog body text is chosen from the current report's template
 * (`probe`, `pharmacogenomic`, `genomic`, `rapid`). On confirm the supplied API
 * call(s) are executed; on cancel nothing happens.
 *
 * Reads `report` from {@link ReportContext}, `setIsSigned` from
 * {@link ConfirmContext}, and uses the react-query client for cache
 * invalidation.
 *
 * @returns An object with a single member, `showConfirmDialog` — see
 *   {@link showDialog} for its parameters and return value.
 *
 * @example
 * const { showConfirmDialog } = useConfirmDialog();
 *
 * // Fire-and-forget: runs the call, then reloads the page.
 * showConfirmDialog(api.put(`/reports/${ident}/...`, body));
 *
 * // Dependent chain: the function is not invoked until the user confirms.
 * showConfirmDialog(async () => {
 *   const [created] = await api.post('/legend', form, {}, true).request();
 *   return api.put(`/reports/${ident}/...`, { legendId: created.legendId }).request();
 * });
 *
 * // Awaitable: no reload; refresh your own data on success.
 * const confirmed = await showConfirmDialog(api.put(...), true);
 * if (confirmed) { refetch(); }
 */
const useConfirmDialog = () => {
  const { report } = useContext(ReportContext);
  const queryClient = useQueryClient();

  /**
   * Opens the confirmation dialog and, on confirm, runs the given API call(s).
   *
   * @param calls - An `ApiCall` / `ApiCallSet` / function (or an array of them) to
   *   execute when the user confirms. Nothing runs until then, so every form must
   *   be inert until started; an already-created promise is rejected with a thrown
   *   error, since it begins running before the dialog is even shown. Use a
   *   function for anything else, including a chain whose later calls depend on an
   *   earlier call's response — an `ApiCallSet` runs its calls in parallel and
   *   cannot express that.
   * @param [waitForConfirmation=false] - Selects the completion strategy:
   *   - `false` (fire-and-forget): on confirm the calls run and the page is
   *     fully reloaded via `reloadWindow()`. Returns `undefined`.
   *   - `true` (awaitable): returns a `Promise<boolean>` that resolves `true`
   *     once the calls succeed, resolves `false` if the user cancels, and
   *     rejects if a call throws. Instead of reloading, the hook invalidates
   *     the report-signatures query and clears the `isSigned` flag; the caller
   *     is responsible for refreshing its own mutated data.
   * @param [confirmText='Task completed, refreshing...'] - Message shown in the
   *   success snackbar after the calls complete.
   * @returns `undefined` when `waitForConfirmation` is `false`; otherwise a
   *   `Promise<boolean>` resolving `true` on success or `false` on cancel, and
   *   rejecting if an API call fails.
   */
  const showDialog = useCallback((calls, waitForConfirmation = false, confirmText = 'Task completed, refreshing...') => {
    const callPromises = Array.isArray(calls) ? calls : [calls];

    // Fail before the dialog opens rather than at confirm time, so a caller that
    // hands over work already in flight is caught immediately.
    if (!callPromises.every(isDeferrable)) {
      throw new Error('showConfirmDialog expects an ApiCall, an ApiCallSet, or a function. A value was supplied that cannot be deferred until the user confirms — wrap it in a function.');
    }

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
            await Promise.all(callPromises.map(startCall));
            snackbar.success(confirmText);
            reloadWindow();
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
            await Promise.all(callPromises.map(startCall));
            snackbar.success(confirmText);
            // No reload: explicitly clear the signature state the reload used
            // to wipe, so the caller can refresh its own data in place.
            if (report?.ident) {
              await queryClient.invalidateQueries(queryKeys.reports.reportSignatures(report.ident));
            }
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
  }, [report?.template.name, report?.ident, queryClient]);

  return {
    showConfirmDialog: showDialog,
  };
};

export default useConfirmDialog;
