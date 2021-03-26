import React, { useCallback, useContext } from 'react';
import {
  IconButton,
  Typography,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
} from '@material-ui/core';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import LastPageIcon from '@material-ui/icons/LastPage';
import FirstPageIcon from '@material-ui/icons/FirstPage';
import ParamsContext, { ParamsContextType } from '../../../ParamsContext';

import './index.scss';

type PaginationPanelProps = {
  totalRows: number,
};

const PaginationPanel = ({
  totalRows,
}: PaginationPanelProps): JSX.Element => {
  const {
    limit, setLimit, offset, setOffset,
  } = useContext(ParamsContext) as ParamsContextType;

  const handleLimitChange = useCallback((event) => {
    setLimit(event.target.value);
  }, [setLimit]);

  const handleFirstPageClick = useCallback(() => {
    setOffset(0);
  }, [setOffset]);

  const handleLastPageClick = useCallback(() => {
    setOffset(totalRows - limit);
  }, [totalRows, setOffset, limit]);

  const handleLeftClick = useCallback(() => {
    if (offset > limit) {
      setOffset(offset - limit);
    } else {
      setOffset(0);
    }
  }, [offset, setOffset, limit]);

  const handleRightClick = useCallback(() => {
    if (offset < totalRows - limit) {
      setOffset(offset + limit);
    } else {
      setOffset(totalRows - limit);
    }
  }, [offset, totalRows, limit, setOffset]);

  return (
    <div className="pagination-panel">
      <FormControl className="pagination-panel__select-box">
        <InputLabel id="select-limit">Results per page</InputLabel>
        <Select
          label="Results per page"
          className="pagination-panel__select"
          id="select-limit"
          value={limit}
          onChange={handleLimitChange}
        >
          <MenuItem value={20}>20</MenuItem>
          <MenuItem value={35}>35</MenuItem>
          <MenuItem value={50}>50</MenuItem>
        </Select>
      </FormControl>
      <Typography className="pagination__text" variant="body2" display="inline">
        {`${offset + 1} to ${offset + limit > totalRows ? totalRows : offset + limit} of ${totalRows}`}
      </Typography>
      <div className="pagination__button">
        <IconButton size="small" disabled={offset === 0} onClick={handleFirstPageClick}>
          <FirstPageIcon />
        </IconButton>
      </div>
      <div className="pagination__button">
        <IconButton size="small" disabled={offset === 0} onClick={handleLeftClick}>
          <ChevronLeftIcon />
        </IconButton>
      </div>
      <Typography className="pagination__text" variant="body2" display="inline">
        {`Page ${Math.ceil((offset / limit) + 1)} of ${Math.ceil((totalRows / limit))}`}
      </Typography>
      <div className="pagination__button">
        <IconButton size="small" disabled={offset >= totalRows - limit} onClick={handleRightClick}>
          <ChevronRightIcon />
        </IconButton>
      </div>
      <div className="pagination__button">
        <IconButton size="small" disabled={offset >= totalRows - limit} onClick={handleLastPageClick}>
          <LastPageIcon />
        </IconButton>
      </div>
    </div>
  );
};

export default PaginationPanel;
