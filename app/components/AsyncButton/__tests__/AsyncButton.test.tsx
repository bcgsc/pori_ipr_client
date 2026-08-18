import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

import AsyncButton from '..';

describe('AsyncButton', () => {
  test('renders its children', () => {
    render(<AsyncButton isLoading={false}>Save</AsyncButton>);

    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
  });

  test('is disabled while loading', () => {
    render(<AsyncButton isLoading>Save</AsyncButton>);

    expect(screen.getByRole('button')).toBeDisabled();
  });

  test('calls onClick when clicked', () => {
    const onClick = jest.fn();
    render(<AsyncButton isLoading={false} onClick={onClick}>Save</AsyncButton>);

    fireEvent.click(screen.getByRole('button'));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  test('reveals the progress then success indicator across a load cycle', () => {
    const { container, rerender } = render(<AsyncButton isLoading={false}>Save</AsyncButton>);

    // Clicking marks loading as started
    fireEvent.click(screen.getByRole('button'));

    rerender(<AsyncButton isLoading>Save</AsyncButton>);
    expect(container.querySelector('.async-button__progress--visible')).toBeInTheDocument();

    rerender(<AsyncButton isLoading={false}>Save</AsyncButton>);
    expect(container.querySelector('.async-button__success--visible')).toBeInTheDocument();
  });
});
