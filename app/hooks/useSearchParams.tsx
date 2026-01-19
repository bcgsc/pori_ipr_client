import { useContext } from 'react';

import SearchParamsContext, { SearchParamsContextType } from '@/context/SearchParamsContext';

const useSearchParams = (): SearchParamsContextType => useContext(SearchParamsContext);

export default useSearchParams;
