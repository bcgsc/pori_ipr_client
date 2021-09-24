import React from 'react';
import { screen, render, fireEvent } from '@testing-library/react';

import DetailDialog from '..';

const mockData = {
  detectedIn: 'DNA',
  gene: {
    name: 'EGFR',
    isImportant: true,
    innerObject: {
      innerInnerValue: 'double nested',
    },
  },
};

const mockArrayData = {
  arrayVal: ['test1', 'test2'],
};

const mockFilteredData = {
  ident: '640aff03-402bdd42-dffa-623b',
  svg: '<svg><g>image here</g></svg>',
  svgTitle: 'test SVG',
  image: 'test image',
};

const mockColumnMapping = {
  detectedIn: 'Detected In',
};

describe('DetailDialog', () => {
  test('It matches the snapshot', () => {
    const { asFragment } = render(
      <DetailDialog
        isOpen
        selectedRow={mockData}
      />,
    );
    expect(asFragment()).toMatchSnapshot();
  });

  test('Keys and values are all shown', () => {
    render(
      <DetailDialog
        isOpen
        selectedRow={mockData}
      />,
    );
    Object.entries(mockData).forEach(([key, val]) => {
      expect(screen.getByText(key, { exact: false })).toBeInTheDocument();
      if (typeof val === 'object') {
        // naive implementation to test recursion in the component
        Object.entries(val).forEach(([innerKey, innerVal]) => {
          expect(screen.getByText(innerKey, { exact: false })).toBeInTheDocument();
          if (typeof innerVal === 'object') {
            Object.entries(innerVal).forEach(([doubleInnerKey, doubleInnerVal]) => {
              expect(screen.getByText(doubleInnerKey, { exact: false })).toBeInTheDocument();
              expect(screen.getByText(doubleInnerVal)).toBeInTheDocument();
            });
          } else {
            expect(screen.getByText(`${innerVal}`)).toBeInTheDocument();
          }
        });
      } else {
        expect(screen.getByText(val)).toBeInTheDocument();
      }
    });
  });

  test('Array values are shown', () => {
    render(
      <DetailDialog
        isOpen
        selectedRow={mockArrayData}
      />,
    );

    Object.entries(mockArrayData).forEach(([key, val]) => {
      expect(screen.getByText(key, { exact: false })).toBeInTheDocument();
      val.forEach((v) => {
        expect(screen.getByText(v, { exact: false })).toBeInTheDocument();
      });
    });
  });

  test('The column mapping changes the displayed key', async () => {
    render(
      <DetailDialog
        columnMapping={mockColumnMapping}
        isOpen
        selectedRow={mockData}
      />,
    );

    expect(await screen.findByText(`${mockColumnMapping.detectedIn}:`)).toBeInTheDocument();
    expect(screen.queryByText('detectedIn', { exact: false })).toBeNull();
  });

  test('Certain fields are filtered from being shown', () => {
    render(
      <DetailDialog
        isOpen
        selectedRow={mockFilteredData}
      />,
    );

    Object.entries(mockFilteredData).forEach(([key, val]) => {
      expect(screen.queryByText(key)).toBeNull();
      expect(screen.queryByText(val)).toBeNull();
    });
  });
});
