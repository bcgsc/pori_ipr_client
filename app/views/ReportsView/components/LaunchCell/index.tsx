import React, { useCallback } from 'react';
import LaunchIcon from '@material-ui/icons/Launch';
import { ICellRendererParams } from '@ag-grid-community/core';
import { useHistory } from 'react-router-dom';

import './index.scss';

const LaunchCell = (params: ICellRendererParams): JSX.Element => {
  const history = useHistory();

  const handleClick = useCallback((event) => {
    const { reportIdent } = params.data;

    // event.button is 1 when middle click is pressed
    if (event.ctrlKey || event.metaKey || event.button === 1) {
      window.open(`/report/${reportIdent}/summary`, '_blank');
    } else {
      history.push({ pathname: `/report/${reportIdent}/summary` });
    }
  }, [history, params]);

  return (
    <LaunchIcon
      className="launch-cell"
      color="action"
      onClick={handleClick}
      onMouseUp={handleClick}
    />
  );
};

export default LaunchCell;
