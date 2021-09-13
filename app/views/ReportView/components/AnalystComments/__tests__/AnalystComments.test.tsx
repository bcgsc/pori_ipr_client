import React from 'react';
import { render, screen } from '@testing-library/react';

import { withReportContext } from '@/test/testHelpers';
import withLoading from '@/hoc/WithLoading';
import { ReportType } from '@/context/ReportContext';
import api from '@/services/api';
import AnalystComments from '..';

const mockReport = {
  ident: '085afd-957bba-55acfd',
} as ReportType;

const mockComments = {
  comments: '<img></img><p>test</p>',
};

const mockComments2 = {
  comments: '<div style="color: red;">test</div>',
};

jest.mock('@/services/api', () => ({
  get: jest.fn(() => ({ request: jest.fn(() => mockComments) })),
}));

describe('AnalystComments', () => {
  test('Img tags are sanitized', async () => {
    api.get.mockReturnValue({ request: jest.fn(() => mockComments) });

    const Component = withLoading(withReportContext(AnalystComments, mockReport));
    render(
      <Component />,
    );

    expect(await screen.findByText('test')).toBeInTheDocument();
    expect(screen.queryByRole('img')).toBeNull();
  });

  test('Style tags are still present', async () => {
    api.get.mockReturnValue({ request: jest.fn(() => mockComments2) });

    const Component = withLoading(withReportContext(AnalystComments, mockReport));
    render(
      <Component />,
    );

    const testElem = await screen.findByText('test');

    expect(testElem).toBeInTheDocument();
    expect(testElem).toHaveAttribute('style', 'color:red');
  });
});
