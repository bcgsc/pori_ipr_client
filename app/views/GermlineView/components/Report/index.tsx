import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import {
  Checkbox,
  FormControlLabel,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  DialogProps,
} from '@mui/material';
import { AgGridReact } from '@ag-grid-community/react';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import useGrid from '@/hooks/useGrid';
import api from '@/services/api';
import GermlineReportContext from '@/context/GermlineReportContext';
import ActionCellRenderer from '@/components/DataTable/components/ActionCellRenderer';
import AlertDialog from '@/components/AlertDialog';
import snackbar from '@/services/SnackbarUtils';
import { GermlineReportType } from '@/context/GermlineReportContext/types';
import withLoading, { WithLoadingInjectedProps } from '@/hoc/WithLoading';
import StrikethroughCell from './components/StrikethroughCell';
import EditDialog from './components/EditDialog';
import Reviews from './components/Reviews';
import columnDefs from './columnDefs';
import { getDate } from '@/utils/date';
import './index.scss';

type GermlineReportProps = WithLoadingInjectedProps;

const GermlineReport = ({
  isLoading,
  setIsLoading,
}: GermlineReportProps): JSX.Element => {
  const { ident } = useParams<{ ident: string }>();
  const { gridApi, colApi, onGridReady } = useGrid();
  const history = useHistory();
  const [report, setReport] = useState<GermlineReportType>();

  const [showAllColumns, setShowAllColumns] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showAlertDialog, setShowAlertDialog] = useState(false);
  const [editData, setEditData] = useState();

  const [menuAnchor, setMenuAnchor] = useState<HTMLElement>();

  useEffect(() => {
    if (ident) {
      const getData = async () => {
        try {
          const reportResp = await api.get(
            `/germline-small-mutation-reports/${ident}`,
          ).request();
          setReport(reportResp);
        } catch (err) {
          snackbar.error(`Network error: ${err}`);
        } finally {
          setIsLoading(false);
        }
      };
      getData();
    }
  }, [ident, setReport, setIsLoading]);

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

  const onEdit = useCallback((rowData) => {
    setShowEditDialog(true);
    setEditData(rowData);
  }, []);

  const handleEditClose = useCallback((newRow) => {
    if (newRow) {
      const newVariants = [...report.variants];
      const index = newVariants.findIndex((variant) => variant.ident === newRow.ident);
      newVariants[index] = newRow;
      setReport((prevVal) => ({ ...prevVal, variants: newVariants }));
    }
    setShowEditDialog(false);
  }, [report]);

  const RowActionCellRenderer = useCallback((row) => (
    <ActionCellRenderer
      onEdit={() => onEdit(row.node.data)}
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...row}
    />
  ), [onEdit]);

  const handleClose = useCallback(async (confirm) => {
    setShowAlertDialog(false);
    setMenuAnchor(null);
    // This could be an event or boolean
    if (confirm) {
      try {
        await api.del(`/germline-small-mutation-reports/${report.ident}`, {}).request();
        snackbar.success('Report deleted');
        history.push('/germline');
      } catch (err) {
        snackbar.error(`Error deleting report: ${err}`);
      }
    }
  }, [report, history]);

  const handleTSVExport = useCallback(() => {
    const date = getDate();

    gridApi.exportDataAsCsv({
      suppressQuotes: true,
      columnSeparator: '\t',
      columnKeys: colApi.getAllDisplayedColumns()
        .filter((col) => col.colDef.headerName !== 'Actions' && col.colDef.headerName)
        .map((col) => col.colId),
      fileName: `ipr_${report.patientId}_${report.ident}_germline_${date}.tsv`,
      processCellCallback: (({ value }) => (typeof value === 'string' ? value?.replace(/,/g, '') : value)),
    });
  }, [colApi, gridApi, report]);

  const handleMenuItemClick = useCallback((action) => {
    switch (action) {
      case 'delete':
        console.log('Delete')
        break;
      case 'export':
        handleTSVExport();
        break;
      default:
        break;
    }
    setMenuAnchor(null);
  }, [handleTSVExport]);

  return (
    <GermlineReportContext.Provider value={{ report, setReport }}>
      <div className="germline-report">
        {!isLoading && (
          <>
            <div className="germline-report__titles">
              <Typography variant="h3">Germline Report</Typography>
              <div className="germline-report__titles--flex">
                <Typography display="inline" variant="h5">
                  {`${report.patientId} - ${report.normalLibrary}`}
                </Typography>
                <>
                  <span className="data-table__action">
                    <IconButton
                      onClick={(event) => setMenuAnchor(event.currentTarget)}
                      className="data-table__icon-button"
                      size="large"
                    >
                      <MoreHorizIcon />
                    </IconButton>
                    <Menu
                      anchorEl={menuAnchor}
                      open={Boolean(menuAnchor)}
                      onClose={() => setMenuAnchor(null)}
                    >
                      <MenuItem onClick={() => setShowAlertDialog(true)}>
                        Remove report
                      </MenuItem>
                      <MenuItem onClick={() => handleMenuItemClick('export')}>
                        Export to TSV
                      </MenuItem>
                    </Menu>
                  </span>
                </>
              </div>
              <AlertDialog
                isOpen={showAlertDialog}
                onClose={handleClose}
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
                enableCellTextSelection
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
      </div>
    </GermlineReportContext.Provider>
  );
};

export default withLoading(GermlineReport);
