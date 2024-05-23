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
import columnDefs from './columnDefs';

import './index.scss';

/**
 * Report table containing all reports
 */
const ReportsTableComponent = (): JSX.Element => {
  const {
    gridApi,
    colApi,
    onGridReady,
  } = useGrid();

  const { adminAccess, unreviewedAccess, nonproductionAccess, allStates, unreviewedStates, nonproductionStates } = useResource();
  const [rowData, setRowData] = useState<ReportType[]>();

  useEffect(() => {
    if (!rowData) {
      const getData = async () => {

        let statesArray = allStates;

        if (!nonproductionAccess) {
          statesArray = statesArray.filter(elem => !nonproductionStates.includes(elem));
        }

        if (!unreviewedAccess) {
          statesArray = statesArray.filter(elem => !unreviewedStates.includes(elem));
        }
        const states = statesArray.join(",");

        const { reports } = await api.get(`/reports${states ? `?states=${states}` : ''}`, {}).request();

        setRowData(reports.map((report: ReportType) => {
          if (report.users.length > 1) {
            console.dir(report.users);
            console.dir(Object.keys(report));
          }
          const [analyst] = report.users
            .filter((u) => u.role === 'analyst')
            .map((u) => u.user);

          const [reviewer] = report.users
            .filter((u) => u.role === 'reviewer')
            .map((u) => u.user);

          const [bioinformatician] = report.users
            .filter((u) => u.role === 'bioinformatician')
            .map((u) => u.user);

          return {
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
          };
        }));
      };
      getData();
    }
  }, [adminAccess, allStates, nonproductionStates, unreviewedStates, nonproductionAccess, unreviewedAccess, rowData]);

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
          Launch: LaunchCell,
        }}
        onGridReady={onGridReady}
        onGridSizeChanged={onGridSizeChanged}
        pagination
        paginationAutoPageSize
        rowData={rowData}
        rowSelection="single"
      />
    </div>
  );
};

export default ReportsTableComponent;
