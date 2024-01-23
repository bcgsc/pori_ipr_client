import React, {
  useEffect, useState, useContext, useCallback,
} from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Tabs,
  Tab,
  AppBar,
} from '@mui/material';
import { AgGridReact } from '@ag-grid-community/react';

import api from '@/services/api';
import snackbar from '@/services/SnackbarUtils';
import ReportContext from '@/context/ReportContext';
import { columnDefs } from '@/views/ReportView/components/KbMatches/columnDefs';
import { columnDefs as smallMutationsColumnDefs } from '@/views/ReportView/components/SmallMutations/columnDefs';
import copyNumberColumnDefs from '@/views/ReportView/components/CopyNumber/columnDefs';
import expressionColumnDefs from '@/views/ReportView/components/Expression/columnDefs';
import structuralVariantsColumnDefs from '@/views/ReportView/components/StructuralVariants/columnDefs';
import { GeneViewerType } from './types';

import KbMatchesActionCellRenderer from '../KbMatchesActionCellRenderer';
import { ActionCellRenderer } from '../ActionCellRenderer';
import NoRowsOverlay from '../NoRowsOverlay';

import './index.scss';

const defaultTableOptions = {
  frameworkComponents: {
    ActionCellRenderer,
    KbMatchesActionCellRenderer,
    NoRowsOverlay,
  },
  noRowsOverlayComponent: 'NoRowsOverlay',
  enableCellTextSelection: true,
};

type GeneViewerProps = {
  isLink: boolean;
  gene: string;
};

const GeneViewer = ({
  gene,
  isLink = false,
}: GeneViewerProps): JSX.Element => {
  const { report } = useContext(ReportContext);

  const [isOpen, setIsOpen] = useState(false);
  const [geneData, setGeneData] = useState<GeneViewerType>();
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = useCallback((_event, newValue: number) => {
    setTabValue(newValue);
  }, []);

  useEffect(() => {
    if (isOpen && gene) {
      const getData = async () => {
        try {
          const resp = await api.get(`/reports/${report.ident}/gene-viewer/${gene}`).request();
          setGeneData(resp);
        } catch {
          snackbar.error(`Error: gene viewer data does not exist for ${gene}`);
          setIsOpen(false);
        }
      };
      getData();
    }
  }, [gene, isOpen, report]);

  if (!gene) return null;

  if (!isLink) {
    return <span>{gene}</span>;
  }

  return (
    <>
      <span
        tabIndex={0}
        role="button"
        onClick={() => setIsOpen(true)}
        onKeyDown={() => setIsOpen(true)}
        className="gene__text"
      >
        {gene}
      </span>
      <Dialog
        onClose={() => setIsOpen(false)}
        open={isOpen}
        maxWidth="xl"
        fullWidth
      >
        <DialogTitle>
          <span className="dialog__title">
            <Typography variant="h5" align="center">
              Gene Viewer
            </Typography>
          </span>
        </DialogTitle>
        <DialogContent>
          <AppBar position="static" elevation={0} color="transparent">
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
            >
              {geneData && Object.entries(geneData).map(([key, value]) => (
                <Tab key={key} label={`${key} (${value.length})`} />
              ))}
            </Tabs>
          </AppBar>
          {geneData && (
          <>
            {tabValue === 0 && (
              <div className="ag-theme-material">
                <AgGridReact
                  rowData={geneData.kbMatches}
                  columnDefs={columnDefs}
                  domLayout="autoHeight"
                  {...defaultTableOptions}
                />
              </div>
            )}
            {tabValue === 1 && (
              <div className="ag-theme-material">
                <AgGridReact
                  rowData={geneData.smallMutations}
                  columnDefs={smallMutationsColumnDefs}
                  domLayout="autoHeight"
                  {...defaultTableOptions}
                />
              </div>
            )}
            {tabValue === 2 && (
              <div className="ag-theme-material">
                <AgGridReact
                  rowData={geneData.copyNumber}
                  columnDefs={copyNumberColumnDefs}
                  domLayout="autoHeight"
                  {...defaultTableOptions}
                />
              </div>
            )}
            {tabValue === 3 && (
              <div className="ag-theme-material">
                <AgGridReact
                  rowData={geneData.expRNA}
                  columnDefs={expressionColumnDefs}
                  domLayout="autoHeight"
                  {...defaultTableOptions}
                />
              </div>
            )}
            {tabValue === 4 && (
            <div className="tab--center">
              {geneData.expDensityGraph.map((graph) => (
                <img
                  key={graph.ident}
                  src={`data:image/png;base64,${graph.data}`}
                  alt="Expression Density Graph"
                />
              ))}
            </div>
            )}
            {tabValue === 5 && (
              <div className="ag-theme-material">
                <AgGridReact
                  rowData={geneData.structuralVariants}
                  columnDefs={structuralVariantsColumnDefs}
                  domLayout="autoHeight"
                  {...defaultTableOptions}
                />
              </div>
            )}
          </>
          )}
        </DialogContent>
        <DialogActions>
          <Button color="primary" onClick={() => setIsOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default GeneViewer;
