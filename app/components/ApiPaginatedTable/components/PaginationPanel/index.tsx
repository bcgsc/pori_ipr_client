import React, { useCallback, useState, useEffect } from 'react';
import {
  IconButton,
} from '@material-ui/core';
import ChevronRight from '@material-ui/icons/ChevronRight';
import ChevronLeft from '@material-ui/icons/ChevronLeft';

type props = {
  onChange: (offset: number) => void,
  gridApi: Record<string, unknown>,
}

const PaginationPanel = ({
  onChange,
  gridApi,
}: props): JSX.Element => {
  const [offset, setOffset] = useState(0);

  const handleLeftClick = useCallback(() => {
    if (offset > 25) {
      setOffset(prevVal => prevVal - 25);
      onChange(offset - 25);
    } else {
      setOffset(0);
      onChange(0);
    }
  }, [offset, onChange]);

  const handleRightClick = useCallback(() => {
    setOffset(prevVal => prevVal + 25);
    onChange(offset + 25);
  }, [offset, onChange]);

  return (
    <div>
      <IconButton onClick={handleLeftClick}>
        <ChevronLeft />
      </IconButton>
      <IconButton onClick={handleRightClick}>
        <ChevronRight />
      </IconButton>
    </div>
  );
};

export default PaginationPanel;
