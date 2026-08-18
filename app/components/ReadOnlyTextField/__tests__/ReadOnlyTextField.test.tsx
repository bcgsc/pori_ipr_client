import React from 'react';
import { render, screen } from '@testing-library/react';

import ReadOnlyTextField from '..';

describe('ReadOnlyTextField', () => {
  test('renders the label and value', () => {
    render(<ReadOnlyTextField label="Age">42</ReadOnlyTextField>);

    expect(screen.getByText('Age')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  test('renders a non-breaking space when the value is empty', () => {
    const { container } = render(<ReadOnlyTextField label="Empty" />);

    expect(container.querySelector('.text-field')?.textContent).toContain(' ');
  });

  test('is underlined by default and not when disabled', () => {
    const { container, rerender } = render(<ReadOnlyTextField label="x">y</ReadOnlyTextField>);
    expect(container.querySelector('.text-field')).toHaveClass('text-field--underlined');

    rerender(<ReadOnlyTextField label="x" isUnderlined={false}>y</ReadOnlyTextField>);
    expect(container.querySelector('.text-field')).not.toHaveClass('text-field--underlined');
  });
});
