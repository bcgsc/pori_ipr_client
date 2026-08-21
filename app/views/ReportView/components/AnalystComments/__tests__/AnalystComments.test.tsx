import React from 'react';
import { readFileSync } from 'fs';
import path from 'path';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { when, resetAllWhenMocks } from 'jest-when';

import { withReportContext } from '@/test/testHelpers';
import withLoading from '@/hoc/WithLoading';
import api, { ApiCall } from '@/services/api';
import { TemplateType, ReportType } from '@/common';
import { SecurityContext } from '@/context/SecurityContext';
import snackbar from '@/services/SnackbarUtils';
import { makeApiError } from '@/test/apiErrorHelpers';
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

const mockSecurityContext = {
  authorizationToken: 'mock-token',
  setAuthorizationToken: () => {},
  userDetails: {},
  setUserDetails: () => {},
};

const mockEndpoints: Record<string, unknown> = {
  [`/reports/${mockReport.ident}/summary/analyst-comments`]: mockComments,
  [`/reports/${mockReport.ident}/signatures`]: mockSignatures,
  [`/templates/${mockReport.template.ident}/signature-types`]: [],
};

jest.mock('@/services/api');
jest.mock('@/services/SnackbarUtils');

describe('AnalystComments', () => {
  beforeEach(() => {
    resetAllWhenMocks();
    (snackbar.error as jest.Mock).mockClear();
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
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const Component = withLoading(withReportContext(AnalystComments, mockReport));
    render(
      <QueryClientProvider client={queryClient}>
        <SecurityContext.Provider value={mockSecurityContext}>
          <Component />
        </SecurityContext.Provider>
      </QueryClientProvider>,
    );

    expect(await screen.findByText('test')).toBeInTheDocument();
    expect(screen.queryByRole('img')).toBeNull();
  });

  test('Style tags are still present', async () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const Component = withLoading(withReportContext(AnalystComments, mockReport));
    render(
      <QueryClientProvider client={queryClient}>
        <SecurityContext.Provider value={mockSecurityContext}>
          <Component />
        </SecurityContext.Provider>
      </QueryClientProvider>,
    );

    const testElem = await screen.findByText('test');

    expect(testElem).toBeInTheDocument();
    expect(testElem).toHaveAttribute('style', 'color:red');
  });

  test('avoids breaking list items inside in print', () => {
    const styles = readFileSync(path.resolve(__dirname, '../index.scss'), 'utf8');

    expect(styles).toMatch(/\.analyst-comments__body\s*\{[\s\S]*?li\s*\{\s*break-inside:\s*avoid;\s*\}/);
  });

  const renderWithFailingComments = (isPrint: boolean) => {
    when(api.get as (endpoint: string) => Partial<ApiCall>)
      .calledWith(`/reports/${mockReport.ident}/summary/analyst-comments`)
      .mockImplementation(() => ({
        request: async () => { throw makeApiError(); },
      }));
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const Component = withLoading(withReportContext(AnalystComments, mockReport));
    return render(
      <QueryClientProvider client={queryClient}>
        <SecurityContext.Provider value={mockSecurityContext}>
          <Component isPrint={isPrint} />
        </SecurityContext.Provider>
      </QueryClientProvider>,
    );
  };

  test('still renders the section when the comments request 404s', async () => {
    renderWithFailingComments(false);

    expect(await screen.findByText('Analyst Comments')).toBeInTheDocument();
  });

  test('names the failure in the snackbar', async () => {
    renderWithFailingComments(false);

    await screen.findByText('Analyst Comments');
    await waitFor(() => expect(snackbar.error).toHaveBeenCalledWith(
      expect.stringContaining('Failed to load analyst comments'),
    ));
  });

  test('shows no snackbar in print', async () => {
    renderWithFailingComments(true);

    await screen.findByText('Analyst Comments');
    expect(snackbar.error).not.toHaveBeenCalled();
  });
});
