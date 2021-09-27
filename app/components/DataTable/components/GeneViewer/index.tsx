import React, {
  useEffect, useState, useContext,
} from 'react';
import PropTypes from 'prop-types';
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
} from '@material-ui/core';
import { useSnackbar } from 'notistack';
import { AgGridReact } from '@ag-grid-community/react';

import api from '@/services/api';
import ReportContext from '@/context/ReportContext';
import { columnDefs } from '@/views/ReportView/components/KbMatches/columnDefs';
import { columnDefs as smallMutationsColumnDefs } from '@/views/ReportView/components/SmallMutations/columnDefs';
import copyNumberColumnDefs from '@/views/ReportView/components/CopyNumber/columnDefs';
import expressionColumnDefs from '@/views/ReportView/components/Expression/columnDefs';
import structuralVariantsColumnDefs from '@/views/ReportView/components/StructuralVariants/columnDefs';
import { GeneViewerType } from './types';

import './index.scss';

type GeneViewerProps = {
  onClose: () => void;
  isOpen: boolean;
  gene: string;
};

const GeneViewer = ({
  onClose,
  isOpen,
  gene,
}: GeneViewerProps): JSX.Element => {
  const snackbar = useSnackbar();
  const { report } = useContext(ReportContext);

  const [geneData, setGeneData] = useState<GeneViewerType>();
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  useEffect(() => {
    if (isOpen) {
      const getData = async () => {
        try {
          const resp = await api.get(`/reports/${report.ident}/gene-viewer/${gene}`).request();
          setGeneData(resp);
        } catch {
          snackbar.enqueueSnackbar(`Error: gene viewer data does not exist for ${gene}`);
          onClose();
        }
      };
      getData();
    }
  }, [gene, onClose, isOpen, report, snackbar]);

  return (
    <Dialog
      onClose={onClose}
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
                />
              </div>
            )}
            {tabValue === 1 && (
              <div className="ag-theme-material">
                <AgGridReact
                  rowData={geneData.smallMutations}
                  columnDefs={smallMutationsColumnDefs}
                  domLayout="autoHeight"
                />
              </div>
            )}
            {tabValue === 2 && (
              <div className="ag-theme-material">
                <AgGridReact
                  rowData={geneData.copyNumber}
                  columnDefs={copyNumberColumnDefs}
                  domLayout="autoHeight"
                />
              </div>
            )}
            {tabValue === 3 && (
              <div className="ag-theme-material">
                <AgGridReact
                  rowData={geneData.expRNA}
                  columnDefs={expressionColumnDefs}
                  domLayout="autoHeight"
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
                />
              </div>
            )}
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button color="primary" onClick={onClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

GeneViewer.propTypes = {
  onClose: PropTypes.func.isRequired,
  gene: PropTypes.string.isRequired,
  isOpen: PropTypes.bool.isRequired,
};

export default GeneViewer;
