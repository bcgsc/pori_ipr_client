import React, { useContext, useCallback } from 'react';
import {
  List,
  ListItem,
  Checkbox,
  Typography,
} from '@material-ui/core';

import ParamsContext, { ParamsContextType } from '../../../ParamsContext';

const ReviewFilter = (): JSX.Element => {
  const {
    reviewFilter,
    setReviewFilter,
    setOffset,
  } = useContext(ParamsContext) as ParamsContextType;

  const handleReviewClicked = useCallback(() => {
    setReviewFilter(!reviewFilter);
    setOffset(0);
  }, [reviewFilter, setOffset, setReviewFilter]);

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
