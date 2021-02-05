import React from 'react';

const ParamsContext = React.createContext({
  limit: 20,
  setLimit: () => {},
  offset: 0,
  setOffset: () => {},
  reviewFilter: false,
  setReviewFilter: () => {},
});

export default ParamsContext;