import React from 'react';
import { render, screen } from '@testing-library/react';

import {
  styleExpectedValue,
  styleUnchangedExpectedValue,
  mockSVGNormal,
  mockSVGWithStyle,
  mockSVGStyleInOtherTags,
  mockSVGWithXMLTag,
  mockSVGFormatError,
} from './mockData';
import SvgImage from '..';

jest.mock('react-virtualized-auto-sizer', () => ({ children }) => children({ height: 600, width: 600 }));

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
        image={mockSVGWithStyle}
      />,
    );

    const svg = await screen.findByTestId('mock');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute(styleExpectedValue.key, styleExpectedValue.value);
  });

  test('It renders an SVG with style tags in other tags', async () => {
    render(
      <SvgImage
        image={mockSVGStyleInOtherTags}
      />,
    );

    const svg = await screen.findByTestId('mock');

    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute(styleExpectedValue.key, styleExpectedValue.value);

    expect(await screen.findByTestId('other'))
      .toHaveAttribute(styleUnchangedExpectedValue.key, styleUnchangedExpectedValue.value);
  });

  test('It renders an SVG with an XML tag without crashing', async () => {
    render(
      <SvgImage
        image={mockSVGWithXMLTag}
      />,
    );

    expect(await screen.findByTestId('mock')).toBeInTheDocument();
  });
});
