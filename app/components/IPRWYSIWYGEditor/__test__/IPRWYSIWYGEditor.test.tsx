import React from 'react';
import {
  render, screen, fireEvent, cleanup,
} from '@testing-library/react';

import IPRWYSIWYGEditor from '../index';

const mockText = 'test value <h1>header</h1>';

describe('TextEditor', () => {
  afterEach(cleanup);

  test('Provided text is visible', async () => {
    render(
      <IPRWYSIWYGEditor
        text={mockText}
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
      <IPRWYSIWYGEditor
        text={mockText}
        isOpen
        onClose={handleClose}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));

    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
