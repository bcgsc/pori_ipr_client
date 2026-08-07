import React from 'react';
import { screen, render } from '@testing-library/react';
import { ICellRendererParams } from '@ag-grid-community/core';

import NotesCellRenderer from '..';

const renderCell = (value: string | null | undefined) => {
  const props = { value } as unknown as ICellRendererParams;
  return render(<NotesCellRenderer {...props} />);
};

describe('NotesCellRenderer', () => {
  test('renders nothing for null value', () => {
    const { container } = renderCell(null);
    expect(container.firstChild).toBeNull();
  });

  test('renders nothing for undefined value', () => {
    const { container } = renderCell(undefined);
    expect(container.firstChild).toBeNull();
  });

  test('renders nothing for empty string', () => {
    const { container } = renderCell('');
    expect(container.firstChild).toBeNull();
  });

  test('renders a single line of text', async () => {
    renderCell('single line text');
    expect(await screen.findByText('single line text')).toBeInTheDocument();
  });

  test('renders multi-line text with br separators', () => {
    const { container } = renderCell('line one\nline two\nline three');
    expect(container.querySelectorAll('br')).toHaveLength(2);
    expect(container).toHaveTextContent('line one');
    expect(container).toHaveTextContent('line two');
    expect(container).toHaveTextContent('line three');
  });

  test('trims trailing newlines so no empty trailing line is rendered', () => {
    const { container } = renderCell('line one\n');
    expect(container.querySelectorAll('br')).toHaveLength(0);
    expect(container).toHaveTextContent('line one');
  });

  test('applies wrapping styles to the container div', () => {
    const { container } = renderCell('some text');
    const div = container.firstChild as HTMLElement;
    expect(div.style.overflowWrap).toBe('break-word');
    expect(div.style.whiteSpace).toBe('normal');
  });
});
