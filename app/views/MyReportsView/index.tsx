import React, {
  useState, useEffect, useCallback,
} from 'react';
import { AgGridReact } from '@ag-grid-community/react';
// eslint-disable-next-line import/no-extraneous-dependencies
import { ColumnState } from '@ag-grid-community/core';

import startCase from '@/utils/startCase';
import useGrid from '@/hooks/useGrid';
import useResource from '@/hooks/useResource';
import api from '@/services/api';
import { ReportType } from '@/context/ReportContext';
import LaunchCell from '@/components/LaunchCell';
import useSecurity from '@/hooks/useSecurity';
import NoRowsOverlay from '@/components/DataTable/components/NoRowsOverlay';
import columnDefs from './columnDefs';

import './index.scss';

const MyReportsComponent = (): JSX.Element => {
  const {
    gridApi,
    colApi,
    onGridReady,
  } = useGrid();

  const {
    adminAccess, unreviewedAccess, nonproductionAccess, allStates, unreviewedStates, nonproductionStates,
  } = useResource();
  const { userDetails } = useSecurity();
  const [rowData, setRowData] = useState<ReportType[]>();

  useEffect(() => {
    if (!rowData) {
      const getData = async () => {
        let statesArray = allStates;

        if (!nonproductionAccess) {
          statesArray = statesArray.filter((elem) => !nonproductionStates.includes(elem));
        }

        if (!unreviewedAccess) {
          statesArray = statesArray.filter((elem) => !unreviewedStates.includes(elem));
        }
        const states = statesArray.join(',');

        const { reports } = await api.get(`/reports${states ? `?states=${states}` : ''}`, {}).request();

        const myReports = [];

        reports.map((report: ReportType) => {
          const [analyst] = report.users
            .filter((u) => u.role === 'analyst')
            .map((u) => u.user);

          const [reviewer] = report.users
            .filter((u) => u.role === 'reviewer')
            .map((u) => u.user);

          const [bioinformatician] = report.users
            .filter((u) => u.role === 'bioinformatician')
            .map((u) => u.user);

          const creator = report.createdBy;

          const allUserIdents = report.users.filter((u) => u.role === 'analyst' || 'reviewer' || 'bioinformatician').map((u) => u.user.ident);

          allUserIdents.push(creator.ident);

          if (allUserIdents.includes(userDetails.ident)) {
            myReports.push({
              patientID: report.patientId,
              analysisBiopsy: report.biopsyName,
              reportType: report.template.name === 'probe' ? 'Targeted Gene' : startCase(report.template.name),
              state: report.state,
              caseType: report?.patientInformation?.caseType,
              project: report.projects.map((project) => project.name).sort().join(', '),
              physician: report?.patientInformation?.physician,
              analyst: analyst ? `${analyst.firstName} ${analyst.lastName}` : null,
              reportIdent: report.ident,
              tumourType: report?.patientInformation?.diagnosis,
              date: report.createdAt,
              reviewer: reviewer ? `${reviewer.firstName} ${reviewer.lastName}` : null,
              bioinformatician: bioinformatician ? `${bioinformatician.firstName} ${bioinformatician.lastName}` : null,
            });
          }
          return null;
        });
        setRowData(myReports);
      };
      getData();
    }
  }, [adminAccess, allStates, nonproductionStates, unreviewedStates, nonproductionAccess, unreviewedAccess, rowData, userDetails.ident]);

  const onGridSizeChanged = useCallback((params) => {
    const MEDIUM_SCREEN_WIDTH_LOWER = 992;

    if (params.clientWidth >= MEDIUM_SCREEN_WIDTH_LOWER) {
      gridApi.sizeColumnsToFit();
    } else {
      const colsToAutoSize = colApi.getAllColumns()
        .filter((col: ColumnState) => !col.pinned)
        .map((col: ColumnState) => col.colId);
      colApi.autoSizeColumns(colsToAutoSize);
    }
  }, [colApi, gridApi]);

  const defaultColDef = {
    sortable: true,
    resizable: true,
    filter: true,
  };

  return (
    <div className="ag-theme-material reports-table__container">
      <AgGridReact
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
        enableCellTextSelection
        frameworkComponents={{
          NoRowsOverlay,
          Launch: LaunchCell,
        }}
        onGridReady={onGridReady}
        onGridSizeChanged={onGridSizeChanged}
        noRowsOverlayComponent="NoRowsOverlay"
        pagination
        paginationAutoPageSize
        rowData={rowData}
        rowSelection="single"
      />
    </div>
  );
};

export default MyReportsComponent;
