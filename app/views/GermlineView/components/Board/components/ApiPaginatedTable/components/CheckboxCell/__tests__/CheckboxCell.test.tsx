import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ICellRendererParams } from 'ag-grid-community';

import CheckboxCell from '..';

const mockData = {
  ident: '025ff-e225a',
};

const mockNode = {
  setData: jest.fn(),
} as unknown as ICellRendererParams['node'];

const mockRestParams = {} as unknown as ICellRendererParams;

jest.mock('@/services/api', () => ({
  __esmodule: true,
  default: 'api',
  ApiCall: jest.fn(),
  ApiCallSet: jest.fn(),
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

  test('The export cell checkbox can be unchecked', async () => {
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
    expect(await screen.findByRole('checkbox', { checked: false })).toBeInTheDocument();
  });

  test('The non-export cell checkbox can not be unchecked', async () => {
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
    expect(await screen.findByRole('checkbox', { checked: true })).toBeInTheDocument();
  });
});
