import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { AgGridReact } from '@ag-grid-community/react';

import columnDefs from './columnDefs';

import './index.scss';

/**
 * @param {object} props props
 * @param {array} props.columnDefs column definitions for ag-grid
 * @param {object} props.$state angularjs state service
 * @param {bool} props.isExternalMode is external mode user
 * @param {bool} props.isAdmin is admin user
 * @return {*} JSX
 */
function ReportsTableComponent(props) {
  const {
    isExternalMode,
    isAdmin,
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
      states: 'ready,active,uploaded,signedoff,archived,reviewed',
    };

    if (isAdmin) {
      opts.states = 'ready,active,uploaded,signedoff,archived,reviewed,nonproduction';
    }

    if (isExternalMode) {
      opts.states = 'reviewed,archived';
    }

    const { reports } = await ReportService.allFiltered(opts);

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

  const onRowClicked = ({ event }) => {
    const selectedRow = gridApi.current.getSelectedRows();
    const [{ reportIdent }] = selectedRow;
    let [{ reportType }] = selectedRow;

    // Convert displayed report type (Genomic, Targeted gene) back to the API values
    reportType = reportType === 'Genomic' ? 'genomic' : 'probe';
    if (event.ctrlKey || event.metaKey) {
      const url = $state.href(`root.reportlisting.${reportType}.summary`, {
        analysis_report: reportIdent,
      });

      window.open(url, '_blank');
    } else {
      $state.go(`root.reportlisting.${reportType}.summary`, {
        analysis_report: reportIdent,
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

ReportsTableComponent.propTypes = {
  columnDefs: PropTypes.arrayOf(PropTypes.object).isRequired,
  isExternalMode: PropTypes.bool.isRequired,
  isAdmin: PropTypes.bool.isRequired,
  $state: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  ReportService: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};

export default ReportsTableComponent;
