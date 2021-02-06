import React, { useContext } from 'react';
import {
  Button,
} from '@material-ui/core';

import ParamsContext from '../../../ParamsContext';

const FilterBar = (): JSX.Element => {
  const {
    setReviewFilter,
    setOffset,
  } = useContext(ParamsContext);

  const handleReviewClicked = () => {
    setReviewFilter(prevVal => !prevVal);
    setOffset(0);
  };

  return (
    <Button onClick={handleReviewClicked}>
      Filter unexported
    </Button>
  );
};

export default FilterBar;
