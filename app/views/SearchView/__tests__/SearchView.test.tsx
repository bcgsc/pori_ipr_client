import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';

import SearchParamsContext from '@/context/SearchParamsContext';
import SearchView from '..';

const renderSearch = () => {
  const queryClient = new QueryClient();
  const searchParamsValue = { searchParams: [], setSearchParams: () => {} };
  return render(
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>
        <SearchParamsContext.Provider value={searchParamsValue}>
          <SearchView />
        </SearchParamsContext.Provider>
      </QueryClientProvider>
    </MemoryRouter>,
  );
};

describe('SearchView', () => {
  test('renders the search controls', () => {
    renderSearch();

    // default category selection
    expect(screen.getByText('Key Variant')).toBeInTheDocument();
    // keyword input prompt
    expect(screen.getByPlaceholderText(/After inputting a keyword/i)).toBeInTheDocument();
  });

  test('defaults the threshold to 0.8', () => {
    renderSearch();

    expect(screen.getByDisplayValue('0.8')).toBeInTheDocument();
  });
});
