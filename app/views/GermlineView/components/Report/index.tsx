import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  LinearProgress,
  Typography,
} from '@material-ui/core';
import { AgGridReact } from '@ag-grid-community/react';

import useGrid from '@/components/hooks/useGrid';
import api from '@/services/api';
import columnDefs from './columnDefs';

import './index.scss';

const GermlineReport = (): JSX.Element => {
  const { ident } = useParams();
  const { gridApi, colApi, onGridReady } = useGrid();

  const [report, setReport] = useState();
  const [isLoading, setIsLoading] = useState(true);

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
  }, [ident]);

  useEffect(() => {
    if (colApi) {
      const colIds = colApi.getAllColumns().filter(col => !col.colDef.autoHeight).map(col => col.colId);
      colApi.autoSizeColumns(colIds, false);
    }
  }, [colApi]);

  return (
    <div className="germline-report">
      {!isLoading && (
        <>
          <div className="germline-report__titles">
            <Typography variant="h3">Germline Report</Typography>
            <Typography variant="h5">{`${report.patientId} - ${report.normalLibrary}`}</Typography>
            <Typography variant="caption">Variants with a strikethrough will not be included in report exports</Typography>
          </div>
          <div className="ag-theme-material germline-report__table">
            <AgGridReact
              autoSizePadding={0}
              columnDefs={columnDefs}
              domLayout="autoHeight"
              onGridReady={onGridReady}
              suppressColumnVirtualisation
              rowData={report.variants}
            />
          </div>
        </>
      )}
      {isLoading && (
        <LinearProgress color="secondary" />
      )}
    </div>
  );
};

export default GermlineReport;
