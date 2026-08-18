import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

import api from '@/services/api';
import { UserType } from '@/common';
import UserAutocomplete from '..';

jest.mock('@/services/api');
jest.mock('notistack', () => ({
  useSnackbar: () => ({ enqueueSnackbar: jest.fn() }),
}));

const mockUser = {
  ident: 'user-uuid',
  firstName: 'Jane',
  lastName: 'Doe',
} as UserType;

describe('UserAutocomplete', () => {
  beforeEach(() => {
    (api.get as jest.Mock).mockReturnValue({
      request: jest.fn().mockResolvedValue([]),
    });
  });

  test('renders the input with the given label', () => {
    render(<UserAutocomplete label="Assignee" />);

    expect(screen.getByLabelText('Assignee')).toBeInTheDocument();
  });

  test('shows the submit affordance when a user is selected', async () => {
    render(<UserAutocomplete label="User" onSubmit={() => {}} defaultValue={mockUser} />);

    expect(await screen.findByTestId('ArrowCircleRightIcon')).toBeInTheDocument();
  });

  test('submits the selected user', async () => {
    const onSubmit = jest.fn();
    render(<UserAutocomplete label="User" onSubmit={onSubmit} defaultValue={mockUser} />);

    const submitButton = (await screen.findByTestId('ArrowCircleRightIcon')).closest('button');
    fireEvent.click(submitButton);

    expect(onSubmit).toHaveBeenCalledWith(mockUser);
  });

  test('shows copy projects and groups options in the add/edit user dialog', async () => {
    render(<UserAutocomplete label="User" addEditUserDialog onSubmit={() => {}} defaultValue={mockUser} />);

    expect(await screen.findByText('Copy Projects')).toBeInTheDocument();
    expect(screen.getByText('Copy Groups')).toBeInTheDocument();
  });
});
