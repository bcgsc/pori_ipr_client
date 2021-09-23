import React from 'react';
import { screen, render, fireEvent } from '@testing-library/react';

import ColumnPicker from '..';

const mockColumns = [
  {
    colId: 'username',
    isVisible: () => true,
    name: 'username',
    visible: true,
  },
  {
    colId: 'password',
    isVisible: () => false,
    name: 'password',
    visible: false,
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
      />,
    );
    expect(await screen.findByText(mockLabel)).toBeInTheDocument();
  });

  test('The checkboxes have the correct states', async () => {
    render(
      <ColumnPicker
        columns={mockColumns}
        isOpen
        label={mockLabel}
      />,
    );

    (await screen.findAllByRole('checkbox')).forEach((checkbox, index) => {
      expect(checkbox.checked).toEqual(mockColumns[index].visible);
    });
  });

  test('It changes checked state upon click', async () => {
    render(
      <ColumnPicker
        columns={mockColumns}
        isOpen
        label={mockLabel}
      />,
    );

    (await screen.findAllByRole('checkbox')).forEach((checkbox, index) => {
      fireEvent.click(checkbox);
      expect(checkbox.checked).toEqual(!mockColumns[index].visible);
    });
  });
});
