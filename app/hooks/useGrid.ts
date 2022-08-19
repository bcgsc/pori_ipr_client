import { useRef, useState } from 'react';
import { GridApi, ColumnApi } from '@ag-grid-community/core';
/**
 * hook for setting up and using ag-grids apis
 * credit: areisle
 */
const useGrid = (): {
  colApi: ColumnApi | null,
  gridApi: GridApi | null,
  onGridReady: ({ api, columnApi }: { api: GridApi, columnApi: ColumnApi }) => void,
  gridReady: boolean,
} => {
  const gridApi = useRef(null);
  const colApi = useRef(null);
  const [gridReady, setGridReady] = useState(false);

  const onGridReady = ({ api, columnApi }: { api: GridApi, columnApi: ColumnApi }) => {
    gridApi.current = api;
    colApi.current = columnApi;
    setGridReady(true);
  };

  return {
    colApi: colApi.current,
    gridApi: gridApi.current,
    gridReady,
    onGridReady,
  };
};

export default useGrid;
