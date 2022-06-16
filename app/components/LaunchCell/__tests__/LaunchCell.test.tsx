/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable react/prop-types */
import React from 'react';
import { screen, render, fireEvent } from '@testing-library/react';
import { MemoryRouter, Router } from 'react-router-dom';
import { AgGridReact } from '@ag-grid-community/react';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';

import { createMemoryHistory } from 'history';

import LaunchCell from '..';

const LaunchCellWithAgGrid = ({
  urlFn = () => {},
  mockData = [{
    reportIdent: '244aabfa-956b0cf9-04388-bbf4',
  }],
}) => (
  <AgGridReact
    columnDefs={[
      {
        cellRenderer: 'Launch',
        cellRendererParams: {
          url: urlFn,
        },
      },
    ]}
    rowData={mockData}
    frameworkComponents={{
      Launch: LaunchCell,
    }}
    suppressColumnVirtualisation
    modules={[ClientSideRowModelModule]}
  />
);

describe('LaunchCell', () => {
  test('It renders and matches the snapshot', () => {
    const mockUrl = jest.fn();
    const { asFragment } = render(
      <MemoryRouter>
        <LaunchCellWithAgGrid
          urlFn={mockUrl}
        />
      </MemoryRouter>,
    );

    expect(asFragment()).toMatchSnapshot();
  });

  test('It renders the icon', async () => {
    render(
      <MemoryRouter>
        <LaunchCellWithAgGrid />
      </MemoryRouter>,
    );

    expect(await screen.findByTestId('launch-cell')).toBeInTheDocument();
  });

  test('It calls the url function with args upon click', async () => {
    const mockUrl = jest.fn();
    const mockIdent = '244aabfa-956b0cf9-04388-bbf4';

    render(
      <MemoryRouter>
        <LaunchCellWithAgGrid
          urlFn={mockUrl}
        />
      </MemoryRouter>,
    );
    fireEvent.click(await screen.findByTestId('launch-cell'));

    expect(mockUrl).toHaveBeenCalledTimes(1);
    expect(mockUrl).toHaveBeenCalledWith(mockIdent);
  });

  test('It calls the url function and history.push upon click', async () => {
    const mockUrl = jest.fn();
    const mockIdent = '244aabfa-956b0cf9-04388-bbf4';
    const history = createMemoryHistory();
    const pushSpy = jest.spyOn(history, 'push');

    render(
      <Router history={history}>
        <LaunchCellWithAgGrid
          urlFn={mockUrl}
        />
      </Router>,
    );
    fireEvent.click(await screen.findByTestId('launch-cell'));

    expect(pushSpy).toHaveBeenCalledTimes(1);
    expect(pushSpy).toHaveBeenCalledWith({ pathname: mockUrl(mockIdent) });
  });

  test('It opens a new tab with a middle click', async () => {
    const mockUrl = jest.fn();
    const openSpy = jest.spyOn(window, 'open').mockImplementation(() => undefined);

    render(
      <MemoryRouter>
        <LaunchCellWithAgGrid
          urlFn={mockUrl}
        />
      </MemoryRouter>,
    );
    fireEvent.click(await screen.findByTestId('launch-cell'), { button: 1 });

    expect(openSpy).toHaveBeenCalledTimes(1);
    expect(openSpy).toHaveBeenCalledWith(mockUrl('244aabfa-956b0cf9-04388-bbf4'), '_blank');
  });
});
