type SearchParamsType = {
  keyword: string;
  category: string;
  threshold: string;
};

type SearchParamsContextType = {
  searchParams: SearchParamsType[] | null,
  setSearchParams: React.Dispatch<React.SetStateAction<SearchParamsType[]>>;
};

export {
  SearchParamsType,
  SearchParamsContextType,
};