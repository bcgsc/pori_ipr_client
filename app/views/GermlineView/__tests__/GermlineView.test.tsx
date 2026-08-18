import React, { Suspense } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import useResource from '@/hooks/useResource';
import snackbar from '@/services/SnackbarUtils';
import GermlineView from '..';

jest.mock('@/hooks/useResource');
jest.mock('@/services/SnackbarUtils');
jest.mock('../components/Board', () => () => <div data-testid="germline-board" />);
jest.mock('../components/Report', () => () => <div data-testid="germline-report" />);

const renderView = (entry = '/germline') => render(
  <MemoryRouter initialEntries={[entry]}>
    <Suspense fallback={null}>
      <GermlineView />
    </Suspense>
  </MemoryRouter>,
);

describe('GermlineView', () => {
  test('renders the germline board for users with access', async () => {
    (useResource as jest.Mock).mockReturnValue({ germlineAccess: true, adminAccess: false });

    renderView();

    expect(await screen.findByTestId('germline-board')).toBeInTheDocument();
  });

  test('warns users without germline access', async () => {
    (useResource as jest.Mock).mockReturnValue({ germlineAccess: false, adminAccess: false });

    renderView();

    await waitFor(() => expect(snackbar.error).toHaveBeenCalledWith(
      'User does not have access to Germline reports',
    ));
  });
});
