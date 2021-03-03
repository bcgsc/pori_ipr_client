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

const ParamsContext = React.createContext({
  limit: 20,
  setLimit: (limit: number) => {},
  offset: 0,
  setOffset: (offset: number) => {},
  reviewFilter: false,
  setReviewFilter: (reviewFilter: boolean) => {},
  searchText: '',
  setSearchText: (searchText: string) => {},
});

export default ParamsContext;

export { ParamsContextType };
