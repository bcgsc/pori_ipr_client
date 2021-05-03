import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import {
  Button,
  Checkbox,
  FormControlLabel,
  LinearProgress,
  Typography,
} from '@material-ui/core';
import { AgGridReact } from '@ag-grid-community/react';

import useGrid from '@/components/hooks/useGrid';
import api from '@/services/api';
import ReportContext from '@/components/ReportContext';
import ActionCellRenderer from '@/components/DataTable/components/ActionCellRenderer';
import AlertDialog from '@/components/AlertDialog';
import snackbar from '@/services/SnackbarUtils';
import StrikethroughCell from './components/StrikethroughCell';
import EditDialog from './components/EditDialog';
import Reviews from './components/Reviews';
import columnDefs from './columnDefs';

import './index.scss';

const GermlineReport = (): JSX.Element => {
  const { ident } = useParams();
  const { colApi, onGridReady } = useGrid();
  const history = useHistory();
  const [report, setReport] = useState();

  const [isLoading, setIsLoading] = useState(true);
  const [showAllColumns, setShowAllColumns] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showAlertDialog, setShowAlertDialog] = useState(false);
  const [editData, setEditData] = useState();

  useEffect(() => {
    if (ident) {
      const getData = async () => {
        const reportResp = await api.get(
          `/germline-small-mutation-reports/${ident}`,
          {},
        ).request();
        setReport(reportResp);
        setIsLoading(false);
      };
      getData();
    }
  }, [ident, setReport]);

  useEffect(() => {
    if (colApi) {
      const colIds = colApi.getAllColumns().filter((col) => !col.colDef.autoHeight).map((col) => col.colId);
      colApi.autoSizeColumns(colIds, false);
    }
  }, [colApi]);

  const handleShowAllColumns = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const { checked } = event.target;
    setShowAllColumns(checked);

    if (checked) {
      colApi.applyColumnState({ defaultState: { hide: false } });
    } else {
      colApi.resetColumnState();
    }
  }, [colApi]);

  const onEdit = (rowData) => {
    setShowEditDialog(true);
    setEditData(rowData);
  };

  const handleEditClose = useCallback((newRow) => {
    if (newRow) {
      const newVariants = [...report.variants];
      const index = newVariants.findIndex((variant) => variant.ident === newRow.ident);
      newVariants[index] = newRow;
      setReport((prevVal) => ({ ...prevVal, variants: newVariants }));
    }
    setShowEditDialog(false);
  }, [report]);

  const RowActionCellRenderer = (row) => {
    const handleEdit = useCallback(() => {
      onEdit(row.node.data);
    }, [row]);

    return (
      <ActionCellRenderer
        onEdit={handleEdit}
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...row}
      />
    );
  };

  const handleConfirmDelete = useCallback(async (confirm) => {
    setShowAlertDialog(false);
    if (confirm) {
      try {
        await api.del(`/germline-small-mutation-reports/${report.ident}`, {}, {}).request();
        snackbar.success('Report deleted');
        history.push('/germline');
      } catch (err) {
        snackbar.error(`Error deleting report: ${err}`);
      }
    }
  }, [report, history]);

  return (
    <ReportContext.Provider value={{ report, setReport }}>
      <div className="germline-report">
        {!isLoading && (
          <>
            <div className="germline-report__titles">
              <Typography variant="h3">Germline Report</Typography>
              <div className="germline-report__titles--flex">
                <Typography display="inline" variant="h5">
                  {`${report.patientId} - ${report.normalLibrary}`}
                </Typography>
                <Button
                  color="secondary"
                  onClick={() => setShowAlertDialog(true)}
                  variant="outlined"
                >
                  Remove report
                </Button>
              </div>
              <AlertDialog
                isOpen={showAlertDialog}
                onClose={handleConfirmDelete}
                title="Confirm"
                text="Are you sure you want to delete this report?"
                confirmText="Confirm"
                cancelText="Cancel"
              />
              <div className="germline-report__titles--flex">
                <Typography display="inline" variant="caption">
                  Variants with a strikethrough will not be included in report exports
                </Typography>
                <FormControlLabel
                  control={(
                    <Checkbox
                      checked={showAllColumns}
                      onChange={handleShowAllColumns}
                      color="secondary"
                    />
                  )}
                  label="Show all columns"
                />
              </div>
            </div>
            <div className="ag-theme-material germline-report__table">
              <AgGridReact
                autoSizePadding={0}
                columnDefs={columnDefs}
                domLayout="autoHeight"
                onGridReady={onGridReady}
                suppressColumnVirtualisation
                rowData={report.variants}
                rowClassRules={{
                  'strikethrough': (params) => params.data.hidden,
                  'low-score': (params) => params.data.score < 100,
                }}
                gridOptions={{
                  rowClass: 'center-text',
                }}
                frameworkComponents={{
                  'strikethroughCell': StrikethroughCell,
                  'actionCell': RowActionCellRenderer,
                }}
                context={{
                  canEdit: true,
                  canDelete: false,
                }}
              />
            </div>
            <EditDialog
              isOpen={showEditDialog}
              onClose={handleEditClose}
              rowData={editData}
            />
            <Reviews />
          </>
        )}
        {isLoading && (
          <LinearProgress color="secondary" />
        )}
      </div>
    </ReportContext.Provider>
  );
};

export default GermlineReport;
