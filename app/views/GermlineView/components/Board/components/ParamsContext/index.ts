import React from 'react';

type ParamsContextType = {
  limit: number;
  setLimit: (limit: number) => void;
  offset: number;
  setOffset: (offset: number) => void;
  reviewFilter: boolean;
  setReviewFilter: (reviewFilter: boolean) => void;
  searchText: string;
  setSearchText: (searchText: string) => void;
};

const ParamsContext = React.createContext<ParamsContextType>({
  limit: 20,
  setLimit: (limit) => {},
  offset: 0,
  setOffset: (offset) => {},
  reviewFilter: false,
  setReviewFilter: (reviewFilter) => {},
  searchText: '',
  setSearchText: (searchText) => {},
});

export default ParamsContext;

export { ParamsContextType };
