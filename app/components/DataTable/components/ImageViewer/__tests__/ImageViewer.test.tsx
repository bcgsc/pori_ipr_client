import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

import ImageViewer from '..';

const mockSelectedRow = {
  image: {
    caption: 'here beith thy image',
    createdAt: '20211-20-01T12:20:10.485Z',
    data: 'dbf2003660cb',
    filename: 'testingimage.png',
    format: 'PNG',
    ident: 'ab502bf-077fbba-0019-9ade',
    key: 'testing.image',
    title: 'Testing Image',
    updatedAt: '20211-20-01T12:20:10.485Z',
  },
};

describe('ImageViewer', () => {
  test('It matches the snapshot', () => {
    const { asFragment } = render(
      <ImageViewer
        onClose={() => {}}
        selectedRow={mockSelectedRow}
        isOpen
      />,
    );
    expect(asFragment()).toMatchSnapshot();
  });

  test('Clicking the close button calls onClose', async () => {
    const mockOnClose = jest.fn();
    render(
      <ImageViewer
        onClose={mockOnClose}
        selectedRow={mockSelectedRow}
        isOpen
      />,
    );
    fireEvent.click(await screen.findByRole('button', { name: 'Close' }));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
    expect(mockOnClose).toHaveBeenCalledWith();
  });
});
