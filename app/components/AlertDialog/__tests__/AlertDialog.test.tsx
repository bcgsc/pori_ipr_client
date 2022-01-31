import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import AlertDialog from '..';

describe('AlertDialog', () => {
  let component;

  test('It renders', () => {
    component = render(
      <AlertDialog
        isOpen
        onClose={() => { }}
        title="Dialog Title"
        text="Mock dialog text"
      />,
    );
    const { getByText } = component;
    expect(getByText('Dialog Title')).toBeInTheDocument();
    expect(getByText('Mock dialog text')).toBeInTheDocument();
  });

  test('It allows custom confirm and cancel text', () => {
    component = render(
      <AlertDialog
        isOpen
        onClose={() => { }}
        title="Dialog Title"
        text="Mock dialog text"
        confirmText="yas"
        cancelText="nyet"
      />,
    );
    const { getByText } = component;
    expect(getByText('yas')).toBeInTheDocument();
    expect(getByText('nyet')).toBeInTheDocument();
  });

  test('It calls onClose with the correct params when confirm is clicked', () => {
    const mockOnClose = jest.fn();

    component = render(
      <AlertDialog
        isOpen
        onClose={mockOnClose}
        title="Dialog Title"
        text="Mock dialog text"
      />,
    );
    const { getByText } = component;
    const confirmButton = getByText(/confirm/i);

    fireEvent.click(confirmButton);
    expect(mockOnClose).toBeCalledWith(true);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  test('It calls onClose with the correct params when cancel is clicked', () => {
    const mockOnClose = jest.fn();

    component = render(
      <AlertDialog
        isOpen
        onClose={mockOnClose}
        title="Dialog Title"
        text="Mock dialog text"
      />,
    );
    const { getByText } = component;
    const cancelButton = getByText(/cancel/i);

    fireEvent.click(cancelButton);
    expect(mockOnClose).toBeCalledWith(false);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  test('It disables confirm button if a comment is required from user', () => {
    const mockOnClose = jest.fn();

    component = render(
      <AlertDialog
        isOpen
        onClose={mockOnClose}
        title="Dialog Title"
        text="Mock dialog text"
        commentRequired
      />,
    );
    const { getByText } = component;
    expect(getByText(/confirm/i)).toBeDisabled();
  });

  test('It re-enables confirm button if a comment is inserted, and calls onClose with correct params when submitted', () => {
    const mockOnClose = jest.fn();
    component = render(
      <AlertDialog
        isOpen
        onClose={mockOnClose}
        title="Dialog Title"
        text="Mock dialog text"
        commentRequired
      />,
    );
    const { getByText, getByLabelText } = component;
    const input = getByLabelText(/comment/i);
    const confirmButton = getByText(/confirm/i);
    expect(confirmButton).toBeDisabled();
    fireEvent.change(input, { target: { value: 'test comment' } });
    expect(confirmButton).not.toBeDisabled();

    fireEvent.click(confirmButton);
    expect(mockOnClose).toBeCalledWith(true, 'test comment');
  });
});
