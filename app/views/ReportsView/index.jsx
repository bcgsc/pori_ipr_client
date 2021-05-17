import React, {
  useRef, useState, useContext,
} from 'react';
import PropTypes from 'prop-types';
import { AgGridReact } from '@ag-grid-community/react';

import startCase from '@/utils/startCase';
import { isExternalMode } from '@/services/management/auth';
import SecurityContext from '@/context/SecurityContext';
import api from '@/services/api';
import columnDefs from './columnDefs';

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

  const { userDetails, adminUser } = useContext(SecurityContext);
  const [rowData, setRowData] = useState();

  const onGridReady = async (params) => {
    gridApi.current = params.api;
    columnApi.current = params.columnApi;

    let states = '';

    if (!adminUser) {
      states = 'ready,active,uploaded,signedoff,archived,reviewed';
    }

    if (isExternalMode(userDetails)) {
      states = 'reviewed,archived';
    }

    const { reports } = await api.get(`/reports?states=${states}`, {});

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
        reportType: report.template.name === 'probe' ? 'Targeted Gene' : startCase(report.template.name),
        state: report.state,
        caseType: report.patientInformation.caseType,
        project: report.projects.map((project) => project.name).sort().join(', '),
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
      const allCols = columnApi.current.getAllColumns().map((col) => col.colId);
      columnApi.current.autoSizeColumns(allCols);
    }
  };

  const onRowClicked = ({ event }) => {
    const selectedRow = gridApi.current.getSelectedRows();
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
}

ReportsTableComponent.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  history: PropTypes.object.isRequired,
};

export default ReportsTableComponent;
