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
import { AgGridReact, AgGridReactProps } from '@ag-grid-community/react';

import api from '@/services/api';
import ReportContext from '@/context/ReportContext';
import { columnDefs } from '@/views/ReportView/components/KbMatches/columnDefs';
import { columnDefs as smallMutationsColumnDefs } from '@/views/ReportView/components/SmallMutations/columnDefs';
import copyNumberColumnDefs from '@/views/ReportView/components/CopyNumber/columnDefs';
import expressionColumnDefs from '@/views/ReportView/components/Expression/columnDefs';
import structuralVariantsColumnDefs from '@/views/ReportView/components/StructuralVariants/columnDefs';
import { ColDef } from '@ag-grid-community/core';
import { GeneViewerType } from './types';

import KbMatchesActionCellRenderer from '../KbMatchesActionCellRenderer';
import { ActionCellRenderer } from '../ActionCellRenderer';
import NoRowsOverlay from '../NoRowsOverlay';

import './index.scss';

const defaultTableOptions: Partial<AgGridReactProps> = {
  frameworkComponents: {
    ActionCellRenderer,
    KbMatchesActionCellRenderer,
    NoRowsOverlay,
  },
  noRowsOverlayComponent: 'NoRowsOverlay',
  enableCellTextSelection: true,
};

const defaultColumnDefs: ColDef = {
  sortable: true,
  filter: true,
};

const nullGeneViewerResp: GeneViewerType = {
  copyNumber: [],
  expDensityGraph: [],
  expRNA: [],
  kbMatchedStatements: [],
  smallMutations: [],
  structuralVariants: [],
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
          // DEVSU-2482 Show table with no rows to show instead of snackbar error for genes that do not exist in report's profile
          setGeneData(nullGeneViewerResp);
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
                  rowData={geneData.kbMatchedStatements}
                  columnDefs={columnDefs}
                  defaultColDef={defaultColumnDefs}
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
                  defaultColDef={defaultColumnDefs}
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
                  defaultColDef={defaultColumnDefs}
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
                  defaultColDef={defaultColumnDefs}
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
                  defaultColDef={defaultColumnDefs}
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
