import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ModuleRegistry } from '@ag-grid-community/core';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { StructuralVariantType } from '@/common';
import SvgViewer from '..';

const mockSelectedRow = {
  breakpoint: 'na',
  gene1: {
    name: 'gene1',
  },
  gene2: {
    name: 'gene2',
  },
  svg: '<svg><g>test SVG</g></svg>',
  svgTitle: 'This is the text that appears',
} as Partial<StructuralVariantType>;

describe('SvgViewer', () => {
  beforeAll(() => {
    jest.resetModules();
    ModuleRegistry.registerModules([
      ClientSideRowModelModule,
    ]);
  });

  test('It matches the snapshot', () => {
    const { asFragment } = render(
      <SvgViewer
        isOpen
        onClose={() => {}}
        selectedRow={mockSelectedRow}
      />,
    );
    expect(asFragment()).toMatchSnapshot();
  });

  test('The dialog is shown when isOpen', async () => {
    render(
      <SvgViewer
        isOpen
        onClose={() => {}}
        selectedRow={mockSelectedRow}
      />,
    );
    expect(await screen.getByRole('dialog')).toBeInTheDocument();
  });

  test('onClose is called', async () => {
    const mockOnClose = jest.fn();
    render(
      <SvgViewer
        isOpen
        onClose={mockOnClose}
        selectedRow={mockSelectedRow}
      />,
    );

    fireEvent.click(await screen.findByRole('button', { name: 'Close' }));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
    expect(mockOnClose).toHaveBeenCalledWith();
  });

  test('The svgTitle text is shown', async () => {
    render(
      <SvgViewer
        isOpen
        onClose={() => {}}
        selectedRow={mockSelectedRow}
      />,
    );
    expect(await screen.findByText(mockSelectedRow.svgTitle)).toBeInTheDocument();
  });
});
