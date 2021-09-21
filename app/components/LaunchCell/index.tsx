import React, { useCallback } from 'react';
import LaunchIcon from '@material-ui/icons/Launch';
import { ICellRendererParams } from '@ag-grid-community/core';
import { useHistory } from 'react-router-dom';

import './index.scss';

type LaunchCellProps = {
  url: (ident: string) => string;
} & ICellRendererParams;

const LaunchCell = (params: LaunchCellProps): JSX.Element => {
  const history = useHistory();

  const handleClick = useCallback((event) => {
    const reportIdent = params.data.reportIdent ?? params.data.ident;

    // event.button is 1 when middle click is pressed
    if (event.ctrlKey || event.metaKey || event.button === 1) {
      window.open(params.url(reportIdent), '_blank');
    } else {
      history.push({ pathname: params.url(reportIdent) });
    }
  }, [history, params]);

  return (
    <LaunchIcon
      className="launch-cell"
      color="action"
      data-testid="launch-cell"
      onClick={handleClick}
      onMouseUp={handleClick}
    />
  );
};

export default LaunchCell;
