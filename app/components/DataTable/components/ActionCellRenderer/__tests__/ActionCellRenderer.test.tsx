import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ColumnApi } from '@ag-grid-community/core';

import ActionCellRenderer from '..';

// eslint-disable-next-line react/display-name
jest.mock('../../SvgViewer', () => (() => (<div role="presentation" />)));
// eslint-disable-next-line react/display-name
jest.mock('../../ImageViewer', () => (() => (<div role="presentation" />)));

const mockSvg = '<svg><g>this is an svg</g></svg>';
const mockImage = 'data:PNG;base64, image data here';

describe('ActionCellRenderer', () => {
  test('It matches the snapshot', () => {
    const { asFragment } = render(
      <ActionCellRenderer data={{}} />,
    );

    expect(asFragment()).toMatchSnapshot();
  });

  test('It shows the detail icon when allowed', async () => {
    render(
      <ActionCellRenderer
        context={{ canViewDetails: true }}
        data={{}}
      />,
    );

    expect(await screen.findByTestId('view-details')).toBeInTheDocument();
  });

  test('It shows the detail dialog when the icon is clicked', async () => {
    const mockColumnApi = {
      getAllColumns: jest.fn(() => []),
    } as unknown as ColumnApi;

    render(
      <ActionCellRenderer
        columnApi={mockColumnApi}
        context={{ canViewDetails: true }}
        data={{}}
      />,
    );

    fireEvent.click(await screen.findByTestId('view-details'));
    expect(await screen.findAllByRole('presentation')).toHaveLength(2);
  });

  test('It links to GraphKB when a single entry exists', async () => {
    const openSpy = jest.spyOn(window, 'open').mockImplementation();
    render(
      <ActionCellRenderer
        data={{
          kbStatementId: '#155:863',
        }}
      />,
    );
    // Find the element and simulate a click event
    fireEvent.click(screen.getByTestId('graphkb'));

    // Assert that the window.open function was called with the expected URL and target
    expect(openSpy).toHaveBeenCalledWith(`${window._env_.GRAPHKB_URL}/view/Statement/155:863`, '_blank');
  });

  test('It shows a link to GraphKB when multiple entries exist', async () => {
    const statements = ['#155:863', '#120:109'];
    render(
      <ActionCellRenderer
        data={{
          kbStatementId: statements,
        }}
      />,
    );

    fireEvent.click(await screen.findByRole('button'));

    statements.forEach(async (statement) => {
      expect(await screen.findByText(statement))
        .toHaveAttribute('href', `${window._env_.GRAPHKB_URL}/view/Statement/${statement.replace('#', '')}`);
    });
  });

  test('It shows the delete icon when allowed', async () => {
    render(
      <ActionCellRenderer
        context={{ canDelete: true }}
        data={{}}
      />,
    );

    expect(await screen.findByTestId('delete')).toBeInTheDocument();
  });

  test('onDelete is called when the delete icon is clicked', async () => {
    const mockOnDelete = jest.fn();
    const mockIdent = 'ffa55bc-cc08852-b43a-b0fa';

    render(
      <ActionCellRenderer
        context={{ canDelete: true }}
        data={{ ident: mockIdent }}
        onDelete={mockOnDelete}
      />,
    );
    const elem = await screen.findByTestId('delete');
    fireEvent.click(elem);

    expect(mockOnDelete).toHaveBeenCalledTimes(1);
    expect(mockOnDelete).toHaveBeenCalledWith(mockIdent);
  });

  test('It shows the edit icon when allowed', async () => {
    render(
      <ActionCellRenderer
        context={{ canEdit: true }}
        data={{}}
      />,
    );

    expect(await screen.findByTestId('edit')).toBeInTheDocument();
  });

  test('onEdit is called when the edit icon is clicked', async () => {
    const mockOnEdit = jest.fn();
    const mockData = {};

    render(
      <ActionCellRenderer
        context={{ canEdit: true }}
        data={mockData}
        onEdit={mockOnEdit}
      />,
    );
    const elem = await screen.findByTestId('edit');
    fireEvent.click(elem);

    expect(mockOnEdit).toHaveBeenCalledTimes(1);
    expect(mockOnEdit).toHaveBeenCalledWith(mockData);
  });

  test('It shows the fusion diagram icon when available', async () => {
    render(
      <ActionCellRenderer
        data={{ svg: mockSvg }}
      />,
    );

    expect(await screen.findByTestId('fusion')).toBeInTheDocument();
  });

  test('It shows the SVG dialog when the icon is clicked', async () => {
    render(
      <ActionCellRenderer
        data={{ svg: mockSvg }}
      />,
    );

    fireEvent.click(await screen.findByTestId('fusion'));
    expect(await screen.findByRole('presentation')).toBeInTheDocument();
  });

  test('It shows the image icon when available', async () => {
    render(
      <ActionCellRenderer
        data={{ image: mockImage }}
      />,
    );

    expect(await screen.findByTestId('image')).toBeInTheDocument();
  });

  test('It shows the image dialog when the icon is clicked', async () => {
    render(
      <ActionCellRenderer
        data={{ image: mockImage }}
      />,
    );

    fireEvent.click(await screen.findByTestId('image'));
    expect(await screen.findByRole('presentation')).toBeInTheDocument();
  });
});
