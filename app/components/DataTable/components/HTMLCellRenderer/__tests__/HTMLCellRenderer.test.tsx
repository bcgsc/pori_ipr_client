import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ICellRendererParams } from '@ag-grid-community/core';

import { HTMLCellRenderer, DisplayMode } from '..';

// jsdom does not implement ResizeObserver, which the component instantiates on mount
const observeMock = jest.fn();
const disconnectMock = jest.fn();
class ResizeObserverMock {
  observe = observeMock;

  unobserve = jest.fn();

  disconnect = disconnectMock;
}

const mockNode = { setRowHeight: jest.fn() } as unknown as ICellRendererParams['node'];
const mockApi = { onRowHeightChanged: jest.fn() } as unknown as ICellRendererParams['api'];

const params = (text: string, mode?: DisplayMode) => ({
  data: { text },
  node: mockNode,
  api: mockApi,
  mode,
}) as unknown as ICellRendererParams & { mode?: DisplayMode };

describe('HTMLCellRenderer', () => {
  beforeAll(() => {
    global.ResizeObserver = ResizeObserverMock as unknown as typeof ResizeObserver;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('It matches the snapshot', () => {
    const { asFragment } = render(<HTMLCellRenderer {...params('<b>bold text</b>')} />);
    expect(asFragment()).toMatchSnapshot();
  });

  test('It renders the provided HTML content', () => {
    render(<HTMLCellRenderer {...params('<b>bold text</b>')} />);
    const bold = screen.getByText('bold text');
    expect(bold).toBeInTheDocument();
    expect(bold.tagName).toBe('B');
  });

  test('It exposes a toggle button with an accessible label', () => {
    render(<HTMLCellRenderer {...params('<p>content</p>')} />);
    expect(
      screen.getByRole('button', { name: /toggle between normal and compact view/i }),
    ).toBeInTheDocument();
  });

  test('It registers a ResizeObserver on the cell', () => {
    render(<HTMLCellRenderer {...params('<p>content</p>')} />);
    expect(observeMock).toHaveBeenCalledTimes(1);
  });

  test('It disconnects the ResizeObserver on unmount', () => {
    const { unmount } = render(<HTMLCellRenderer {...params('<p>content</p>')} />);
    unmount();
    expect(disconnectMock).toHaveBeenCalledTimes(1);
  });

  test('It toggles display mode on click without throwing', () => {
    // The click handler walks up to the enclosing grid cell, so provide one
    render(
      <div role="gridcell">
        <HTMLCellRenderer {...params('<p>content</p>')} />
      </div>,
    );
    const cell = screen.getByRole('button', { name: /toggle/i });

    // normal -> compact, then compact -> normal
    expect(() => {
      fireEvent.click(cell);
      fireEvent.click(cell);
    }).not.toThrow();
  });
});
