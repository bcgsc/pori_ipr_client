import React, { Suspense } from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import AdminView from '..';

jest.mock('../components/Users/index.tsx', () => () => <div data-testid="admin-users" />);
jest.mock('../components/Groups/index.tsx', () => () => <div data-testid="admin-groups" />);

const renderView = (entry: string) => render(
  <MemoryRouter initialEntries={[entry]}>
    <Suspense fallback={null}>
      <AdminView />
    </Suspense>
  </MemoryRouter>,
);

describe('AdminView', () => {
  test('routes to the users admin page', async () => {
    renderView('/admin/users');

    expect(await screen.findByTestId('admin-users')).toBeInTheDocument();
  });

  test('routes to the groups admin page', async () => {
    renderView('/admin/groups');

    expect(await screen.findByTestId('admin-groups')).toBeInTheDocument();
  });
});
