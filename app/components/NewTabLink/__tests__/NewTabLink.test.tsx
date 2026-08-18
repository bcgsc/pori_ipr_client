import React from 'react';
import { render, screen } from '@testing-library/react';

import NewTabLink from '..';

describe('NewTabLink', () => {
  test('renders the text linking to the given url', () => {
    render(<NewTabLink link="https://example.com/gene" text="BRAF" />);

    const link = screen.getByText('BRAF');
    expect(link).toHaveAttribute('href', 'https://example.com/gene');
  });

  test('opens in a new tab without leaking the opener', () => {
    render(<NewTabLink link="https://example.com" text="Example" />);

    const link = screen.getByText('Example');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });
});
