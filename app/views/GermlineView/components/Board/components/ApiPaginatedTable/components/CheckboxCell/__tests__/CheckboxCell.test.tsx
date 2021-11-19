import React from 'react';
import {
  render,
  screen,
  fireEvent,
  waitFor,
} from '@testing-library/react';
import { ICellRendererParams } from '@ag-grid-community/core';

import CheckboxCell from '..';

const mockData = {
  ident: '025ff-e225a',
  exported: true,
};

const mockNode = {
  setData: jest.fn(),
} as unknown as ICellRendererParams['node'];

const mockRestParams = {} as unknown as ICellRendererParams;

jest.mock('@/services/api', () => ({
  put: () => ({ request: async () => ({ body: mockData }) }),
}));

jest.mock('notistack', () => ({
  __esmodule: true,
  default: 'snackbar',
  useSnackbar: jest.fn(() => ({ enqueueSnackbar: (msg, type) => null })),
}));

describe('TextEditor', () => {
  test('The checkbox is checked', async () => {
    render(
      <CheckboxCell
        isExportCell
        value
        data={mockData}
        node={mockNode}
        {...mockRestParams}
      />,
    );
    expect(await screen.findByRole('checkbox', { checked: true })).toBeInTheDocument();
  });

  test('The checkbox is not checked', async () => {
    render(
      <CheckboxCell
        isExportCell
        value={false}
        data={mockData}
        node={mockNode}
        {...mockRestParams}
      />,
    );
    expect(await screen.findByRole('checkbox', { checked: false })).toBeInTheDocument();
  });

  test('The export cell checkbox calls setData when unchecking', async () => {
    const mockSetData = jest.fn();
    const mockNode = {
      setData: mockSetData,
    } as unknown as ICellRendererParams['node'];

    render(
      <CheckboxCell
        isExportCell
        value
        data={mockData}
        node={mockNode}
        {...mockRestParams}
      />,
    );
    fireEvent.click(await screen.findByRole('checkbox', { checked: true }));
    waitFor(() => expect(mockSetData).toHaveBeenCalledTimes(1));
  });

  test('The non-export cell checkbox does not call setData on click', async () => {
    const mockSetData = jest.fn();
    const mockNode = {
      setData: mockSetData,
    } as unknown as ICellRendererParams['node'];

    render(
      <CheckboxCell
        isExportCell={false}
        value
        data={mockData}
        node={mockNode}
        {...mockRestParams}
      />,
    );
    fireEvent.click(await screen.findByRole('checkbox', { checked: true }));
    expect(mockSetData).toHaveBeenCalledTimes(0);
  });
});
