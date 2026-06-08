import React from 'react';
import { render } from '@testing-library/react';

import PageBreak from '..';

describe('PageBreak', () => {
  test('renders a page-break element', () => {
    const { container } = render(<PageBreak />);

    expect(container.querySelector('.page-break')).toBeInTheDocument();
  });
});
