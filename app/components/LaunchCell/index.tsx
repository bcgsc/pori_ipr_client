import React, { useCallback, useMemo } from 'react';
import LaunchIcon from '@mui/icons-material/Launch';
import { Link } from '@mui/material';
import { ICellRendererParams } from '@ag-grid-community/core';
import { useHistory } from 'react-router-dom';

import './index.scss';

type LaunchCellProps = {
  url: (ident: string) => string;
} & ICellRendererParams;

const LaunchCell = ({
  data: {
    reportIdent,
    ident,
  },
  url,
}: LaunchCellProps): JSX.Element => {
  const history = useHistory();
  const linkHref = useMemo(() => url(reportIdent ?? ident), [reportIdent, ident, url]);
  const handleClick = useCallback((event) => {
    event.preventDefault();
    // event.button is 1 when middle click is pressed
    if (event.ctrlKey || event.metaKey || event.button === 1) {
      window.open(linkHref, '_blank');
    } else {
      history.push({ pathname: linkHref });
    }
  }, [history, linkHref]);

  return (
    <Link
      href={linkHref}
      onClick={handleClick}
    >
      <LaunchIcon
        className="launch-cell"
        color="action"
        data-testid="launch-cell"
      />
    </Link>
  );
};

export default LaunchCell;
