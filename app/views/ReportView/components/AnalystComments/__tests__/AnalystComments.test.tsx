import React from 'react';
import { render, screen } from '@testing-library/react';
import { when, resetAllWhenMocks } from 'jest-when';

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

jest.mock('@/services/api');

describe('AnalystComments', () => {
  beforeEach(() => resetAllWhenMocks())

  test('Img tags are sanitized', async () => {
    when(api.get)
      .mockImplementation(() => ({ request: async () => null }))
      .calledWith(`/reports/${mockReport.ident}/summary/analyst-comments`)
      .mockImplementation(() => ({ request: async () => mockComments }));

    const Component = withLoading(withReportContext(AnalystComments, mockReport));
    render(
      <Component />,
    );

    expect(await screen.findByText('test')).toBeInTheDocument();
    expect(screen.queryByRole('img')).toBeNull();
  });

  test('Style tags are still present', async () => {
    when(api.get)
      .mockImplementation(() => ({ request: async () => null }))
      .calledWith(`/reports/${mockReport.ident}/summary/analyst-comments`)
      .mockImplementation(() => ({ request: async () => mockComments2 }));

    const Component = withLoading(withReportContext(AnalystComments, mockReport));
    render(
      <Component />,
    );

    const testElem = await screen.findByText('test');

    expect(testElem).toBeInTheDocument();
    expect(testElem).toHaveAttribute('style', 'color:red');
  });
});
