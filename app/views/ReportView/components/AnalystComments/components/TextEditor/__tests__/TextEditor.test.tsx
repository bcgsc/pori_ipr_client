import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

import TextEditor from '..';

const mockText = 'test value <h1>header</h1>';

describe('TextEditor', () => {
  test('Provided text is visible', async () => {
    render(
      <TextEditor
        analystComments={mockText}
        isOpen
        onClose={() => {}}
      />,
    );
    expect(await screen.findByText('test value')).toBeInTheDocument();
    expect(await screen.findByRole('heading', { level: 1, name: 'header' })).toBeInTheDocument();
  });

  test('Close function is called', () => {
    const handleClose = jest.fn();
    render(
      <TextEditor
        analystComments={mockText}
        isOpen
        onClose={handleClose}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));

    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
