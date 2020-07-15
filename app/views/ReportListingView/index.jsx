import React, { useRef, useState, useEffect } from 'react';
import { AgGridReact } from '@ag-grid-community/react';

import columnDefs from './columnDefs';
import { isExternalMode } from '@/services/management/auth';
import SecurityContext from '@/components/SecurityContext';
import ReportService from '@/services/reports/report.service';

import './index.scss';

/**
 * Report table containing all reports
 */
function ReportsTableComponent(props) {
  const {
    history,
  } = props;

  const gridApi = useRef();
  const columnApi = useRef();

  const [rowData, setRowData] = useState();
  const [admin, setAdmin] = useState(false);
  const [externalMode, setExternalMode] = useState(true);

  useEffect(() => {
    setExternalMode(isExternalMode(SecurityContext));
  }, [isExternalMode]);

  const onGridReady = async (params) => {
    gridApi.current = params.api;
    columnApi.current = params.columnApi;

    const opts = {
      all: true,
      states: 'ready,active,uploaded,signedoff,archived,reviewed',
    };

    if (admin) {
      opts.states = 'ready,active,uploaded,signedoff,archived,reviewed,nonproduction';
    }

    if (externalMode) {
      opts.states = 'reviewed,archived';
    }

    const reportService = new ReportService();
    const { reports } = await reportService.allFiltered(opts);

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
    }));
  };

  const onGridSizeChanged = (params) => {
    const MEDIUM_SCREEN_WIDTH_LOWER = 992;

    if (params.clientWidth >= MEDIUM_SCREEN_WIDTH_LOWER) {
      gridApi.current.sizeColumnsToFit();
    } else {
      const allCols = columnApi.current.getAllColumns().map(col => col.colId);
      columnApi.current.autoSizeColumns(allCols);
    }
  };

  const onRowClicked = ({ event }) => {
    const selectedRow = gridApi.current.getSelectedRows();
    const [{ reportIdent }] = selectedRow;

    if (event.ctrlKey || event.metaKey) {
      window.open(`${window.location.href}/report/${reportIdent}/summary`, '_blank');
    } else {
      history.push({
        pathname: `/report/${reportIdent}/summary`,
      });
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
}

export default ReportsTableComponent;
