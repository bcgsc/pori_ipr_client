import React from 'react';
import { render, screen } from '@testing-library/react';

import {
  mockSVGNormal,
  mockSVGStyle,
  mockSVGStyleInOtherTags,
  mockSVGWithXMLTag,
  mockSVGFormatError,
} from './mockData';
import SvgImage from '..';

describe('SvgImage', () => {
  test('It renders a normal SVG', async () => {
    render(
      <SvgImage
        image={mockSVGNormal}
      />,
    );

    /* 'mock' test ID assigned to mockSVG to verify it renders */
    expect(await screen.findByTestId('mock')).toBeInTheDocument();
  });

  test('It renders an SVG with style tags', async () => {
    render(
      <SvgImage
        image={mockSVGStyle}
      />,
    );

    expect(await screen.findByTestId('mock')).toBeInTheDocument();
  });

  test('It renders an SVG with style tags in other tags', async () => {
    render(
      <SvgImage
        image={mockSVGStyleInOtherTags}
      />,
    );

    expect(await screen.findByTestId('mock')).toBeInTheDocument();
  });

  test('It renders an SVG with an XML tag', async () => {
    render(
      <SvgImage
        image={mockSVGWithXMLTag}
      />,
    );

    expect(await screen.findByTestId('mock')).toBeInTheDocument();
  });

  test('It fails to render an SVG that is not formatted correctly', async () => {
    let error;

    try {
      render(
        <SvgImage
          image={mockSVGFormatError}
        />,
      );
    } catch (err) {
      error = err;
    }

    expect(error).not.toBeUndefined();
  });
});
