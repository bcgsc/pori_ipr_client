import React, { useState, useEffect } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { AgGridReact } from '@ag-grid-community/react';
// eslint-disable-next-line import/no-extraneous-dependencies
import { RowClickedEvent } from '@ag-grid-community/core';

import api from '@/services/api';
import useGrid from '@/hooks/useGrid';
import withLoading, { WithLoadingInjectedProps } from '@/hoc/WithLoading';
import snackbar from '@/services/SnackbarUtils';
import columnDefs from '../ReportsView/columnDefs';

import '../ReportsView/index.scss';

type PatientsViewProps = WithLoadingInjectedProps;

const PatientsView = ({
  isLoading,
  setIsLoading,
}: PatientsViewProps): JSX.Element => {
  const { patientId } = useParams<{ patientId: string }>();
  const history = useHistory();
  const [rowData, setRowData] = useState();
  const { gridApi, colApi, onGridReady } = useGrid();

  useEffect(() => {
    if (patientId) {
      const getData = async () => {
        try {
          const { reports } = await api.get(`/reports?searchText=${patientId}`).request();
          setRowData(reports.map((report) => {
            const [analyst] = report.users
              .filter((u) => u.role === 'analyst' && !u.deletedAt)
              .map((u) => u.user);

            if (!report.patientInformation) {
              report.patientInformation = {};
            }

            return {
              patientID: report.patientId,
              analysisBiopsy: report.biopsyName,
              reportType: report.type === 'genomic' ? 'Genomic' : 'Targeted Gene',
              state: report.state,
              caseType: report.patientInformation.caseType,
              project: report.projects.map((project) => project.name).sort().join(', '),
              physician: report.patientInformation.physician,
              analyst: analyst ? `${analyst.firstName} ${analyst.lastName}` : null,
              reportIdent: report.ident,
              tumourType: report.patientInformation.diagnosis,
              date: report.createdAt,
            };
          }).filter((report) => (
            report.patientID === patientId || report.alternateIdentifier === patientId
          )));
        } catch (err) {
          snackbar.error(`Network error: ${err}`);
        } finally {
          setIsLoading(false);
        }
      };

      getData();
    }
  }, [patientId, setIsLoading]);

  const onGridSizeChanged = (params) => {
    const MEDIUM_SCREEN_WIDTH_LOWER = 992;

    if (params.clientWidth >= MEDIUM_SCREEN_WIDTH_LOWER) {
      gridApi.sizeColumnsToFit();
    } else {
      const allCols = colApi.getAllColumns().map((col) => col.getColId());
      colApi.autoSizeColumns(allCols);
    }
  };

  const onRowClicked = ({ event }: RowClickedEvent) => {
    const selectedRow = gridApi.getSelectedRows();
    const [{ reportIdent }] = selectedRow;

    if ((event as PointerEvent).ctrlKey || (event as PointerEvent).metaKey) {
      window.open(`/report/${reportIdent}/summary`, '_blank');
    } else {
      history.push({ pathname: `/report/${reportIdent}/summary` });
    }
  };

  const defaultColDef = {
    sortable: true,
    resizable: true,
    filter: true,
  };

  return (
    <div className="ag-theme-material reports-table__container">
      {!isLoading && (
        <AgGridReact
          columnDefs={columnDefs}
          rowData={rowData}
          defaultColDef={defaultColDef}
          pagination
          paginationAutoPageSize
          rowSelection="single"
          onGridReady={onGridReady}
          onRowClicked={onRowClicked}
          onGridSizeChanged={onGridSizeChanged}
        />
      )}
    </div>
  );
};

export default withLoading(PatientsView);
