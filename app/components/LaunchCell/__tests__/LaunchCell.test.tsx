import React from 'react';
import { screen, render, fireEvent } from '@testing-library/react';
import { MemoryRouter, Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';

import LaunchCell from '..';

describe('LaunchCell', () => {
  test('It renders and matches the snapshot', () => {
    const { asFragment } = render(
      <MemoryRouter>
        <LaunchCell />
      </MemoryRouter>,
    );

    expect(asFragment()).toMatchSnapshot();
  });

  test('It renders the icon', async () => {
    render(
      <MemoryRouter>
        <LaunchCell />
      </MemoryRouter>,
    );

    expect(await screen.findByTestId('launch-cell')).toBeInTheDocument();
  });

  test('It calls the url function with args upon click', async () => {
    const mockUrl = jest.fn();
    const mockIdent = '244aabfa-956b0cf9-04388-bbf4';

    render(
      <MemoryRouter>
        <LaunchCell
          url={mockUrl}
          data={{
            reportIdent: mockIdent,
          }}
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
        <LaunchCell
          url={mockUrl}
          data={{
            ident: mockIdent,
          }}
        />
      </Router>,
    );
    fireEvent.click(await screen.findByTestId('launch-cell'));

    expect(pushSpy).toHaveBeenCalledTimes(1);
    expect(pushSpy).toHaveBeenCalledWith({ pathname: mockUrl(mockIdent) });
  });

  test('It opens a new tab with a middle click', async () => {
    const mockUrl = jest.fn();
    const mockIdent = '244aabfa-956b0cf9-04388-bbf4';

    const openSpy = jest.spyOn(window, 'open').mockImplementation(() => undefined);

    render(
      <MemoryRouter>
        <LaunchCell
          url={mockUrl}
          data={{
            reportIdent: mockIdent,
          }}
        />
      </MemoryRouter>,
    );
    fireEvent.click(await screen.findByTestId('launch-cell'), { button: 1 });

    expect(openSpy).toHaveBeenCalledTimes(1);
    expect(openSpy).toHaveBeenCalledWith(mockUrl(mockIdent), '_blank');
  });
});
