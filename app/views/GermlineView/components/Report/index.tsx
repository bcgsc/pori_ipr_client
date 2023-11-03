import React, {
  useEffect, useState, useCallback, useMemo,
} from 'react';
import { useParams, useHistory } from 'react-router-dom';
import {
  Checkbox,
  FormControlLabel,
  Typography,
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material';
import { AgGridReact } from '@ag-grid-community/react';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import useGrid from '@/hooks/useGrid';
import api from '@/services/api';
import GermlineReportContext from '@/context/GermlineReportContext';
import { ActionCellRenderer } from '@/components/DataTable/components/ActionCellRenderer';
import AlertDialog from '@/components/AlertDialog';
import snackbar from '@/services/SnackbarUtils';
import { GermlineReportType, VariantType } from '@/context/GermlineReportContext/types';
import withLoading, { WithLoadingInjectedProps } from '@/hoc/WithLoading';
import { getDate } from '@/utils/date';
import StrikethroughCell from './components/StrikethroughCell';
import EditDialog from './components/EditDialog';
import Reviews from './components/Reviews';
import columnDefs from './columnDefs';
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
  const [editData, setEditData] = useState<VariantType>();

  const [menuAnchor, setMenuAnchor] = useState<HTMLElement>();

  const germlineReportContextValue = useMemo(() => ({ report, setReport }), [report]);

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
      const colIds = colApi.getAllColumns().filter((col) => !col.getColDef().autoHeight).map((col) => col.getColId());
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

    gridApi.resetRowHeights();
  }, [colApi, gridApi]);

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

  const handleDeleteAlertClose = useCallback(async (confirm) => {
    setShowAlertDialog(false);
    setMenuAnchor(null);
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
    setMenuAnchor(null);
    const date = getDate();
    gridApi.exportDataAsCsv({
      suppressQuotes: true,
      columnSeparator: '\t',
      columnKeys: colApi.getAllDisplayedColumns()
        .filter((col) => col.getColDef().headerName !== 'Actions' && col.getColDef().headerName)
        .map((col) => col.getColId()),
      fileName: `ipr_${report.patientId}_${report.ident}_germline_${date}.tsv`,
      processCellCallback: ({ value }) => {
        if (typeof value === 'string') {
          return value.replace(/[,]/g, ' ').replace(/[\n]/g, ';');
        }
        return value;
      },
    });
  }, [colApi, gridApi, report]);

  return (
    <GermlineReportContext.Provider value={germlineReportContextValue}>
      <div className="germline-report">
        {!isLoading && (
          <>
            <div className="germline-report__titles">
              <Typography variant="h3">Germline Report</Typography>
              <div className="germline-report__titles--flex">
                <Typography display="inline" variant="h5">
                  {`${report.patientId} - ${report.normalLibrary}`}
                </Typography>
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
                    <MenuItem onClick={() => handleTSVExport()}>
                      Export to TSV
                    </MenuItem>
                  </Menu>
                </span>
              </div>
              <AlertDialog
                isOpen={showAlertDialog}
                onClose={handleDeleteAlertClose}
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
                  strikethrough: (params) => params.data.hidden,
                  'low-score': (params) => params.data.score < 100,
                }}
                gridOptions={{
                  rowClass: 'center-text',
                  defaultColDef: {
                    resizable: true,
                  },
                }}
                frameworkComponents={{
                  strikethroughCell: StrikethroughCell,
                  actionCell: RowActionCellRenderer,
                }}
                context={{
                  canEdit: true,
                  canDelete: false,
                  reportId: report.ident,
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
