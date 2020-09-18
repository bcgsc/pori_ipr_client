import React, { useState, useEffect } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { AgGridReact } from '@ag-grid-community/react';
import { useGrid } from '@bcgsc/react-use-grid';

import ReportService from '@/services/reports/report.service';
import columnDefs from '../ReportsView/columnDefs';

import '../ReportsView/index.scss';

const PatientsView = () => {
  const { patientId } = useParams();
  const history = useHistory();
  const [rowData, setRowData] = useState();
  const { gridApi, columnApi, onGridReady } = useGrid();

  useEffect(() => {
    if (patientId) {
      const getData = async () => {
        const { reports } = await ReportService.allFiltered({ searchText: patientId });
        setRowData(reports.map((report) => {
          const [analyst] = report.users
            .filter(u => u.role === 'analyst' && !u.deletedAt)
            .map(u => u.user);

          if (!report.patientInformation) {
            report.patientInformation = {};
          }

          return {
            patientID: report.patientId,
            analysisBiopsy: report.biopsyName,
            reportType: report.type === 'genomic' ? 'Genomic' : 'Targeted Gene',
            state: report.state,
            caseType: report.patientInformation.caseType,
            project: report.projects.map(project => project.name).sort().join(', '),
            physician: report.patientInformation.physician,
            analyst: analyst ? `${analyst.firstName} ${analyst.lastName}` : null,
            reportIdent: report.ident,
            tumourType: report.patientInformation.diagnosis,
            date: report.createdAt,
          };
        }).filter(report => (
          report.patientID === patientId || report.alternateIdentifier === patientId
        )));
      };

      getData();
    }
  }, [patientId]);

  const onGridSizeChanged = (params) => {
    const MEDIUM_SCREEN_WIDTH_LOWER = 992;

    if (params.clientWidth >= MEDIUM_SCREEN_WIDTH_LOWER) {
      gridApi.sizeColumnsToFit();
    } else {
      const allCols = columnApi.getAllColumns().map(col => col.colId);
      columnApi.autoSizeColumns(allCols);
    }
  };

  const onRowClicked = ({ event }) => {
    const selectedRow = gridApi.getSelectedRows();
    const [{ reportIdent }] = selectedRow;

    if (event.ctrlKey || event.metaKey) {
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
    </div>
  );
};

export default PatientsView;
