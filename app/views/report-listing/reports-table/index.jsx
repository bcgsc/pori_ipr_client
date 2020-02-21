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

  const [rowData, setRowData] = useState();

  const onGridReady = async (params) => {
    gridApi.current = params.api;
    gridApi.current.sizeColumnsToFit();

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
        patientID: report.pog.POGID,
        analysisBiopsy: report.analysis.analysis_biopsy,
        reportType: report.type === 'genomic' ? 'Genomic' : 'Targeted Gene',
        state: report.state,
        caseType: report.patientInformation.caseType,
        project: report.pog.projects.map(project => project.name).sort().join(', '),
        physician: report.patientInformation.physician,
        analyst: analyst ? `${analyst.firstName} ${analyst.lastName}` : null,
        tumourType: report.patientInformation.tumourType,
        reportID: report.ident,
        date: report.createdAt,
      };
    }));
  };

  const onSelectionChanged = () => {
    const selectedRow = gridApi.current.getSelectedRows();
    const [{ patientID, reportID }] = selectedRow;
    let [{ reportType }] = selectedRow;

    // Convert displayed report type (Genomic, Targeted gene) back to the API values
    reportType = reportType === 'Genomic' ? 'genomic' : 'probe';
    $state.go(`root.reportlisting.pog.${reportType}.summary`, {
      POG: patientID, analysis_report: reportID,
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
