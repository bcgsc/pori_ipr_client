import React, { useContext } from 'react';
import {
  List,
  ListItem,
  Checkbox,
  Typography,
} from '@material-ui/core';

import ParamsContext from '../../../ParamsContext';

const ReviewFilter = (): JSX.Element => {
  const {
    reviewFilter,
    setReviewFilter,
    setOffset,
  } = useContext(ParamsContext);

  const handleReviewClicked = () => {
    setReviewFilter(prevVal => !prevVal);
    setOffset(0);
  };

  return (
    <List>
      <ListItem onClick={handleReviewClicked}>
        <Checkbox checked={reviewFilter} />
        <Typography>
          Show only reviewed + unexported reports
        </Typography>
      </ListItem>
    </List>
  );
};

export default ReviewFilter;
