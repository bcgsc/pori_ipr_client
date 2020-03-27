import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { AgGridReact } from 'ag-grid-react';

import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';

import './index.scss';

/**
 * @param {object} props props
 * @property {array} props.rowData table row data
 * @property {array} props.columnDefs column definitions for ag-grid
 * @property {object} props.$state angularjs state service
 * @return {*} JSX
 */
function ReportsTableComponent(props) {
  const {
    columnDefs,
    isExternalMode,
    $state,
    ReportService,
  } = props;

  const gridApi = useRef();
  const columnApi = useRef();

  const [rowData, setRowData] = useState();

  const onGridReady = async (params) => {
    gridApi.current = params.api;
    columnApi.current = params.columnApi;

    const opts = {
      all: true,
      states: 'ready,active,presented,uploaded,signedoff,archived',
    };

    if (isExternalMode) {
      opts.states = 'presented,archived';
    }

    let { reports } = await ReportService.allFiltered(opts);

    // Remove test reports that are missing the patient info section
    reports = reports.filter(r => r.patientInformation);

    setRowData(reports.map((report) => {
      const [analyst] = report.users
        .filter(u => u.role === 'analyst' && !u.deletedAt)
        .map(u => u.user);

      return {
        patientID: report.patientId,
        analysisBiopsy: report.biopsyName,
        reportType: report.type === 'genomic' ? 'Genomic' : 'Targeted Gene',
        state: report.state,
        caseType: report.patientInformation.caseType,
        project: report.projects.map(project => project.name).sort().join(', '),
        physician: report.patientInformation.physician,
        analyst: analyst ? `${analyst.firstName} ${analyst.lastName}` : null,
        tumourType: report.patientInformation.tumourType,
        reportID: report.ident,
        date: report.createdAt,
      };
    }));

    const allCols = columnApi.current.getAllColumns().map(col => col.colId);
    columnApi.current.autoSizeColumns(allCols);
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

  const onSelectionChanged = () => {
    const selectedRow = gridApi.current.getSelectedRows();
    const [{ reportID }] = selectedRow;
    let [{ reportType }] = selectedRow;

    // Convert displayed report type (Genomic, Targeted gene) back to the API values
    reportType = reportType === 'Genomic' ? 'genomic' : 'probe';
    $state.go(`root.reportlisting.${reportType}.summary`, {
      analysis_report: reportID,
    });
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
        onSelectionChanged={onSelectionChanged}
        onGridReady={onGridReady}
        onGridSizeChanged={onGridSizeChanged}
      />
    </div>
  );
}

ReportsTableComponent.propTypes = {
  columnDefs: PropTypes.arrayOf(PropTypes.object).isRequired,
  isExternalMode: PropTypes.bool.isRequired,
  $state: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  ReportService: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};

export default ReportsTableComponent;
