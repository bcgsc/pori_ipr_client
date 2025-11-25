import React from 'react';
import { SearchParamsType, SearchParamsContextType } from './types';

const SearchParamsContext = React.createContext<SearchParamsContextType>({
  searchParams: null,
  setSearchParams: () => {[]},
});

export default SearchParamsContext;

export type {
  SearchParamsType,
  SearchParamsContextType,
};
