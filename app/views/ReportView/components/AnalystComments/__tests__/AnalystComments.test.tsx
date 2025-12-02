import React from 'react';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { when, resetAllWhenMocks } from 'jest-when';

import { withReportContext } from '@/test/testHelpers';
import withLoading from '@/hoc/WithLoading';
import { ReportType } from '@/context/ReportContext';
import api, { ApiCall } from '@/services/api';
import { TemplateType } from '@/common';
import AnalystComments from '..';

const mockTemplate = {
  ident: '085afd-957bbc-55acfd',
} as TemplateType;

const mockReport = {
  ident: '085afd-957bba-55acfd',
  template: mockTemplate,
} as ReportType;

const mockSignatures = {
  ident: 'c89d256a-5867-43d3-9031-86dfe23b1db6',
  createdAt: '2025-06-11T00:15:06.104Z',
  updatedAt: '2025-06-18T22:26:02.458Z',
  reviewerSignedAt: null,
  authorSignedAt: null,
  creatorSignedAt: null,
  reviewerSignature: null,
  authorSignature: null,
  creatorSignature: null,
};

const mockComments = {
  comments: '<div><img></img><p style="color: red;">test</p></div>',
};

const mockEndpoints: Record<string, unknown> = {
  [`/reports/${mockReport.ident}/summary/analyst-comments`]: mockComments,
  [`/reports/${mockReport.ident}/signatures`]: mockSignatures,
  [`/templates/${mockReport.template.ident}/signature-types`]: [],
};

jest.mock('@/services/api');

describe('AnalystComments', () => {
  beforeEach(() => {
    resetAllWhenMocks();
    // Default fallback if no endpoint matches
    when(api.get as (endpoint: string) => Partial<ApiCall>)
      .mockImplementation(() => ({ request: async () => null }));

    // Dynamically mock all specific endpoints
    for (const [endpoint, response] of Object.entries(mockEndpoints)) {
      when(api.get as (endpoint: string) => Partial<ApiCall>)
        .calledWith(endpoint)
        .mockImplementation(() => ({
          request: async () => response,
        }));
    }
  });

  test('Img tags are sanitized', async () => {
    const queryClient = new QueryClient();
    const Component = withLoading(withReportContext(AnalystComments, mockReport));
    render(
      <QueryClientProvider client={queryClient}>
        <Component />
      </QueryClientProvider>,
    );

    expect(await screen.findByText('test')).toBeInTheDocument();
    expect(screen.queryByRole('img')).toBeNull();
  });

  test('Style tags are still present', async () => {
    const queryClient = new QueryClient();
    const Component = withLoading(withReportContext(AnalystComments, mockReport));
    render(
      <QueryClientProvider client={queryClient}>
        <Component />
      </QueryClientProvider>,
    );

    const testElem = await screen.findByText('test');

    expect(testElem).toBeInTheDocument();
    expect(testElem).toHaveAttribute('style', 'color:red');
  });
});
