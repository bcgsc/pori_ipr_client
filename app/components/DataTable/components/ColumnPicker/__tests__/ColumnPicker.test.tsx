import React from 'react';
import { screen, render, fireEvent } from '@testing-library/react';

import { ColumnPicker } from '..';

const mockColumns = [
  {
    colId: 'username',
    getColId: () => 'username',
    name: 'username',
    isVisible: () => true,
  },
  {
    colId: 'password',
    getColId: () => 'password',
    name: 'password',
    isVisible: () => false,
  },
  {
    colId: 'email',
    getColId: () => 'email',
    name: 'email address',
    isVisible: () => false,
  },
];

const mockLabel = 'Registered Users Table';

describe('ColumnPicker', () => {
  test('It matches the snapshot', () => {
    const { asFragment } = render(
      <ColumnPicker
        columns={mockColumns}
        isOpen
        label={mockLabel}
        onClose={() => {}}
      />,
    );
    expect(asFragment()).toMatchSnapshot();
  });

  test('The dialog is not rendered when isOpen is false', () => {
    render(
      <ColumnPicker
        columns={mockColumns}
        isOpen={false}
        label={mockLabel}
        onClose={() => {}}
      />,
    );
    expect(screen.queryByRole('presentation')).toBeNull();
  });

  test('The label is shown', async () => {
    render(
      <ColumnPicker
        columns={mockColumns}
        isOpen
        label={mockLabel}
        onClose={() => {}}
      />,
    );
    expect(await screen.findByText(mockLabel)).toBeInTheDocument();
  });

  test('The checkboxes have the correct starting states', async () => {
    render(
      <ColumnPicker
        columns={mockColumns}
        isOpen
        label={mockLabel}
        onClose={() => {}}
      />,
    );

    (await screen.findAllByRole('checkbox')).forEach((checkbox: HTMLInputElement, index) => {
      expect(checkbox.checked).toEqual(mockColumns[index].isVisible());
    });
  });

  test('It changes checked state upon click', async () => {
    render(
      <ColumnPicker
        columns={mockColumns}
        isOpen
        label={mockLabel}
        onClose={() => {}}
      />,
    );

    (await screen.findAllByRole('checkbox')).forEach((checkbox: HTMLInputElement, index) => {
      fireEvent.click(checkbox);
      expect(checkbox.checked).toEqual(!mockColumns[index].isVisible());
    });
  });

  describe('When visibleColumn prop is provided', () => {
    test('Use the visibleColumn prop as initial checkbox state', async () => {
      const { findAllByRole } = render(
        <ColumnPicker
          columns={mockColumns}
          visibleColumnIds={['password']}
          isOpen
          label={mockLabel}
          onClose={() => { }}
        />,
      );
      const checkboxes = await findAllByRole('checkbox');
      checkboxes.forEach((checkbox: HTMLInputElement, index) => {
        if (index === 1) {
          expect(checkbox.checked).toEqual(true);
        } else {
          expect(checkbox.checked).toEqual(false);
        }
      });
    });

    test('The checkboxes are controlled internally', () => {
      const { getByLabelText } = render(
        <ColumnPicker
          columns={mockColumns}
          visibleColumnIds={['password']}
          isOpen
          label={mockLabel}
          onClose={() => { }}
        />,
      );
      const usernameCheckbox = getByLabelText('username');
      expect((usernameCheckbox as HTMLInputElement).checked).toEqual(false);
      fireEvent.click(usernameCheckbox);
      expect((usernameCheckbox as HTMLInputElement).checked).toEqual(true);
    });
  });
});
