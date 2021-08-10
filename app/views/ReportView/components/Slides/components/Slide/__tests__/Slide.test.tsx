import React from 'react';
import {
  fireEvent, render, screen,
} from '@testing-library/react';

import EditContext from '@/context/EditContext';
import Slide from '..';
import SlideType from '../../../types';

const mockSlide = {
  object: 'af34acc60',
  object_type: 'PNG',
  name: 'Look at this photograph / Every time I do, it makes me laugh',
} as SlideType;

describe('Slide', () => {
  test('It renders the img tag with correct attrs', async () => {
    render(
      <Slide
        slide={mockSlide}
      />,
    );

    const renderedImage = await screen.findByRole('img');

    expect(renderedImage).toBeInTheDocument();
    expect(renderedImage).toHaveAttribute('alt', mockSlide.name);
    expect(renderedImage).toHaveAttribute(
      'src',
      `data:${mockSlide.object_type};base64, ${mockSlide.object}`,
    );
  });

  test('It renders the image name as a header', async () => {
    render(
      <Slide
        slide={mockSlide}
      />,
    );

    expect(
      await screen.findByRole('heading', { name: mockSlide.name }),
    ).toBeInTheDocument();
  });

  test('The delete button is shown when the user can edit', async () => {
    render(
      <EditContext.Provider value={{ canEdit: true, setCanEdit: () => {} }}>
        <Slide
          isPrint={false}
          slide={mockSlide}
        />
      </EditContext.Provider>,
    );

    expect(await screen.findByRole('button')).toBeInTheDocument();
  });

  test('The delete button is not shown when the user can not edit', () => {
    render(
      <EditContext.Provider value={{ canEdit: false, setCanEdit: () => {} }}>
        <Slide
          isPrint={false}
          slide={mockSlide}
        />
      </EditContext.Provider>,
    );

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  test('The delete button is not shown in the print view', () => {
    render(
      <EditContext.Provider value={{ canEdit: true, setCanEdit: () => {} }}>
        <Slide
          isPrint
          slide={mockSlide}
        />
      </EditContext.Provider>,
    );

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  test('The onDelete function is called when the button is pressed', async () => {
    const mockDelete = jest.fn();

    render(
      <EditContext.Provider value={{ canEdit: true, setCanEdit: () => {} }}>
        <Slide
          isPrint={false}
          onDelete={mockDelete}
          slide={mockSlide}
        />
      </EditContext.Provider>,
    );
    fireEvent.click(await screen.findByRole('button'));

    expect(mockDelete).toHaveBeenCalledTimes(1);
  });
});
