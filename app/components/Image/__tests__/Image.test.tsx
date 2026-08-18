import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

import Image, { ImageType } from '..';

const mockImage = {
  data: 'BASE64DATA',
  title: 'Circos Plot',
  caption: 'A genome circos plot',
  format: 'png',
  key: 'img-1',
} as ImageType;

describe('Image', () => {
  test('renders the image from its base64 data', () => {
    render(<Image image={mockImage} />);

    const img = screen.getByAltText('Circos Plot');
    expect(img).toHaveAttribute('src', 'data:image/png;base64,BASE64DATA');
  });

  test('renders nothing when there is no image data', () => {
    const { container } = render(<Image image={{} as ImageType} />);

    expect(container).toBeEmptyDOMElement();
  });

  test('shows the title and caption when enabled', () => {
    render(<Image image={mockImage} showTitle showCaption />);

    expect(screen.getByText('Circos Plot')).toBeInTheDocument();
    expect(screen.getByText('A genome circos plot')).toBeInTheDocument();
  });

  test('zooms to an enlarged copy when clicked', () => {
    render(<Image image={mockImage} />);

    fireEvent.click(screen.getByAltText('Circos Plot'));

    expect(screen.getAllByAltText('Circos Plot')).toHaveLength(2);
  });

  test('does not zoom when zooming is disabled', () => {
    render(<Image image={mockImage} isZoomable={false} />);

    fireEvent.click(screen.getByAltText('Circos Plot'));

    expect(screen.getAllByAltText('Circos Plot')).toHaveLength(1);
  });
});
