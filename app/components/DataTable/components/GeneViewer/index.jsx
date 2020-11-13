import React, {
  useEffect, useState, useContext, useCallback,
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
import SnackbarContext from '@bcgsc/react-snackbar-provider';
import DataTable from '../..';
import api from '../../../../services/api';
import { columnDefs } from '@/views/ReportView/components/KbMatches/columnDefs';
import { columnDefs as smallMutationsColumnDefs } from '@/views/ReportView/components/SmallMutations/columnDefs';
import copyNumberColumnDefs from '@/views/ReportView/components/CopyNumber/columnDefs';
import expressionColumnDefs from '@/views/ReportView/components/Expression/columnDefs';
import structuralVariantsColumnDefs from '@/views/ReportView/components/StructuralVariants/columnDefs';

import './index.scss';


/**
 * @param {object} props props
 * @param {func} props.onClose parent close handler
 * @param {string} props.gene gene name
 * @param {string} props.reportIdent current report ID for API calls
 * @param {bool} props.isOpen is open?
 * @return {*} JSX
 */
const GeneViewer = (props) => {
  const {
    onClose,
    isOpen,
    gene,
    reportIdent,
  } = props;
  
  const [geneData, setGeneData] = useState();
  const [tabValue, setTabValue] = useState(0);
  const snackbar = useContext(SnackbarContext);

  const handleClose = useCallback((value) => {
    columnDefs[0].cellRendererParams = { link: true };
    smallMutationsColumnDefs[0].cellRendererParams = { link: true };
    copyNumberColumnDefs[0].cellRendererParams = { link: true };
    expressionColumnDefs[0].cellRendererParams = { link: true };
    structuralVariantsColumnDefs[0].cellRendererParams = { link: true };
    onClose(value);
  }, [onClose]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  useEffect(() => {
    if (isOpen) {
      const getData = async () => {
        try {
          const call = api.get(`/reports/${reportIdent}/gene-viewer/${gene}`);
          const resp = await call.request();
          setGeneData(resp);
        } catch {
          snackbar.add(`Error: gene viewer data does not exist for ${gene}`);
          handleClose(null);
        }
      };
      // Don't show gene viewer link when in gene viewer
      columnDefs[0].cellRendererParams = { link: false };
      smallMutationsColumnDefs[0].cellRendererParams = { link: false };
      copyNumberColumnDefs[0].cellRendererParams = { link: false };
      expressionColumnDefs[0].cellRendererParams = { link: false };
      structuralVariantsColumnDefs[0].cellRendererParams = { link: false };
      getData();
    }
  }, [gene, handleClose, isOpen, reportIdent, snackbar]);

  return (
    <Dialog
      onClose={handleClose}
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
};

GeneViewer.propTypes = {
  onClose: PropTypes.func.isRequired,
  gene: PropTypes.string.isRequired,
  reportIdent: PropTypes.string.isRequired,
  isOpen: PropTypes.bool.isRequired,
};

export default GeneViewer;
