import React, { useEffect, useState } from 'react';
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
import DataTable from '../..';
import geneViewerApi from '../../../../services/reports/geneViewer';
import { columnDefs } from '../../../../views/report/genomic-report/kb-matches/columnDefs';
import smallMutationsColumnDefs from '../../../../views/report/genomic-report/small-mutations/columnDefs';
import copyNumberColumnDefs from '../../../../views/report/genomic-report/copy-number-analyses/columnDefs';
import expressionColumnDefs from '../../../../views/report/genomic-report/expression/columnDefs';
import structuralVariantsColumnDefs from '../../../../views/report/genomic-report/structural-variants/columnDefs';

import './index.scss';

/**
 * @param {object} props props
 * @param {func} props.onClose parent close handler
 * @param {string} props.gene gene name
 * @param {string} props.reportIdent current report ID for API calls
 * @param {bool} props.open is open?
 * @return {*} JSX
 */
function GeneViewer(props) {
  const {
    onClose,
    open,
    gene,
    reportIdent,
  } = props;
  
  const [geneData, setGeneData] = useState();
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    if (open) {
      const api = async () => {
        const resp = await geneViewerApi(gene, reportIdent);
        setGeneData(resp);
      };
      api();
    }
  }, [open]);

  const handleClose = (value) => {
    onClose(value);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Dialog
      onClose={handleClose}
      open={open}
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
              <DataTable
                rowData={geneData.kbMatches}
                columnDefs={columnDefs}
                reportIdent={reportIdent}
              />
            )}
            {tabValue === 1 && (
              <DataTable
                rowData={geneData.smallMutations}
                columnDefs={smallMutationsColumnDefs}
                reportIdent={reportIdent}
              />
            )}
            {tabValue === 2 && (
              <DataTable
                rowData={geneData.copyNumber}
                columnDefs={copyNumberColumnDefs}
                reportIdent={reportIdent}
              />
            )}
            {tabValue === 3 && (
              <DataTable
                rowData={geneData.expRNA}
                columnDefs={expressionColumnDefs}
                reportIdent={reportIdent}
              />
            )}
            {tabValue === 4 && (
              <div className="tab--center">
                {geneData.expDensityGraph.map(graph => (
                  <img
                    key={graph.ident}
                    src={`data:image/png;base64,${graph.data}`}
                    alt="Expression Density Graph"
                  />
                ))}
              </div>
            )}
            {tabValue === 5 && (
              <DataTable
                rowData={geneData.structuralVariants}
                columnDefs={structuralVariantsColumnDefs}
                reportIdent={reportIdent}
              />
            )}
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button color="primary" onClick={handleClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

GeneViewer.propTypes = {
  onClose: PropTypes.func.isRequired,
  gene: PropTypes.string.isRequired,
  reportIdent: PropTypes.string.isRequired,
  open: PropTypes.bool.isRequired,
};

export default GeneViewer;
