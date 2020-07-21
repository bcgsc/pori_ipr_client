import React, { useCallback, useMemo, useState } from 'react';

/**
 * hook for setting up and using ag-grids apis
 */
const useGrid = () => {
  const [gridApi, setGridApi] = useState();
  const [colApi, setColApi] = useState();

  const onGridReady = useCallback(({ api, columnApi }) => {
    setGridApi(api);
    setColApi(columnApi);
  }, []);

  const grid = useMemo(() => ({
    colApi,
    gridApi,
    onGridReady,
  }), [colApi, gridApi, onGridReady]);

  return grid;
};

export default useGrid;
