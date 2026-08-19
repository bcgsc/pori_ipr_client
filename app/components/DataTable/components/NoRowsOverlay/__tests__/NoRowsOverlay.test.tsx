import React from 'react';
import { render, screen } from '@testing-library/react';
import type { INoRowsOverlayParams } from '@ag-grid-community/core';

import NoRowsOverlay from '..';

// The component only reads hasChildren; the rest of INoRowsOverlayParams is unused
const params = (hasChildren?: boolean) => ({ hasChildren }) as INoRowsOverlayParams & { hasChildren?: boolean };

describe('NoRowsOverlay', () => {
  test('It matches the snapshot', () => {
    const { asFragment } = render(<NoRowsOverlay {...params()} />);
    expect(asFragment()).toMatchSnapshot();
  });

  test('It renders the no rows message', () => {
    render(<NoRowsOverlay {...params()} />);
    expect(screen.getByText('No Rows To Show')).toBeInTheDocument();
  });

  test('It applies the children modifier class when hasChildren is true', () => {
    const { container } = render(<NoRowsOverlay {...params(true)} />);
    expect(container.querySelector('.no-rows')).toHaveClass('no-rows--children');
  });

  test('It does not apply the children modifier class when hasChildren is false', () => {
    const { container } = render(<NoRowsOverlay {...params(false)} />);
    expect(container.querySelector('.no-rows')).not.toHaveClass('no-rows--children');
  });

  test('It does not apply the children modifier class when hasChildren is undefined', () => {
    const { container } = render(<NoRowsOverlay {...params()} />);
    expect(container.querySelector('.no-rows')).not.toHaveClass('no-rows--children');
  });
});
