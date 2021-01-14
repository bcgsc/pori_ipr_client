import React, { useContext } from 'react';
import {
  Button,
} from '@material-ui/core';

import ParamsContext from '../../../ParamsContext';

type FilterBarProps = {
  onFilter: (isFiltered: boolean) => void,
};

const FilterBar = ({ onFilter }: FilterBarProps): JSX.Element => {
  const { reviewFilter, setReviewFilter } = useContext(ParamsContext);

  const handleReviewClicked = () => {
    setReviewFilter(prevVal => !prevVal);
  };

  return (
    <Button onClick={handleReviewClicked}>
      Filter unexported
    </Button>
  );
};

export default FilterBar;
