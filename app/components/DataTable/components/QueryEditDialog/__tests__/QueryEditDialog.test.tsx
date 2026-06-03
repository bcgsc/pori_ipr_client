import React from 'react';
import {
  render, screen, fireEvent, waitFor,
} from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';

import SearchParamsContext from '@/context/SearchParamsContext';
import QueryEditDialog from '..';

// SearchBar (rendered inside the dialog) requires searchParams to be an array
const mockSearchParamsContext = {
  searchParams: [],
  setSearchParams: () => {},
};

const renderDialog = (isApiLoading = false) => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>
        <SearchParamsContext.Provider value={mockSearchParamsContext}>
          <QueryEditDialog isApiLoading={isApiLoading} />
        </SearchParamsContext.Provider>
      </QueryClientProvider>
    </MemoryRouter>,
  );
};

describe('QueryEditDialog', () => {
  test('It renders the Edit Query trigger button', () => {
    renderDialog();
    expect(screen.getByRole('button', { name: /edit query/i })).toBeInTheDocument();
  });

  test('The trigger is disabled and shows a spinner while the api is loading', () => {
    renderDialog(true);
    expect(screen.getByRole('button', { name: /edit query/i })).toBeDisabled();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  test('The dialog is closed initially', () => {
    renderDialog();
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  test('Clicking the trigger opens the dialog', async () => {
    renderDialog();
    fireEvent.click(screen.getByRole('button', { name: /edit query/i }));

    const dialog = await screen.findByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument();
  });

  test('Closing the dialog hides it', async () => {
    renderDialog();
    fireEvent.click(screen.getByRole('button', { name: /edit query/i }));
    await screen.findByRole('dialog');

    fireEvent.click(screen.getByRole('button', { name: /close/i }));

    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  });
});
