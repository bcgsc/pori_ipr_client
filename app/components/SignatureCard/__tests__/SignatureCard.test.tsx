import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

import ReportContext from '@/context/ReportContext';
import SignatureCard, { SignatureType } from '..';
import { mockNullData, mockNullObjectData, mockObjectData } from './mockData';

describe('SignatureCard', () => {
  test('Author and sign button are visible', async () => {
    render(
      <ReportContext.Provider value={{ canEdit: true, report: null, setReport: () => {} }}>
        <SignatureCard
          title="Author"
          type="author"
          signatures={null}
          onClick={() => {}}
        />
      </ReportContext.Provider>,
    );
    expect(await screen.findByText('Author')).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: 'Sign' })).toBeInTheDocument();
  });

  test('Sign button is not visible without edit permissions', async () => {
    render(
      <ReportContext.Provider value={{ canEdit: false, report: null, setReport: () => {} }}>
        <SignatureCard
          title="Author"
          type="author"
          signatures={null}
          onClick={() => {}}
        />
      </ReportContext.Provider>,
    );
    expect(screen.queryByRole('button', { name: 'Sign' })).not.toBeInTheDocument();
  });

  test('Sign button calls onClick', async () => {
    const handleClick = jest.fn();
    render(
      <ReportContext.Provider value={{ canEdit: true, report: null, setReport: () => {} }}>
        <SignatureCard
          title="Author"
          type="author"
          signatures={null}
          onClick={handleClick}
        />
      </ReportContext.Provider>,
    );
    fireEvent.click(await screen.findByRole('button', { name: 'Sign' }));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test('Sign button is visible when reviewerSignature is null', async () => {
    render(
      <ReportContext.Provider value={{ canEdit: true, report: null, setReport: () => {} }}>
        <SignatureCard
          title="Reviewer"
          type="reviewer"
          signatures={mockNullData as SignatureType}
          onClick={() => {}}
        />
      </ReportContext.Provider>,
    );

    expect(await screen.findByRole('button', { name: 'Sign' })).toBeInTheDocument();
  });

  test('Sign button is visible when reviewerSignature has null data', async () => {
    render(
      <ReportContext.Provider value={{ canEdit: true, report: null, setReport: () => {} }}>
        <SignatureCard
          title="Reviewer"
          type="reviewer"
          signatures={mockNullObjectData as SignatureType}
          onClick={() => {}}
        />
      </ReportContext.Provider>,
    );

    expect(await screen.findByRole('button', { name: 'Sign' })).toBeInTheDocument();
  });

  test('Reviewer name & remove signature button are visible', async () => {
    render(
      <ReportContext.Provider value={{ canEdit: true, report: null, setReport: () => {} }}>
        <SignatureCard
          title="Reviewer"
          type="reviewer"
          signatures={mockObjectData as SignatureType}
          onClick={() => {}}
        />
      </ReportContext.Provider>,
    );

    expect(screen.queryByRole('button', { name: 'Sign' })).not.toBeInTheDocument();
    expect(await screen.findByRole('button', { name: /^((?!Sign).)*$/ })).toBeInTheDocument();
  });

  test('No buttons are visible in print view', async () => {
    render(
      <ReportContext.Provider value={{ canEdit: true, report: null, setReport: () => {} }}>
        <SignatureCard
          title="Reviewer"
          type="reviewer"
          signatures={mockObjectData as SignatureType}
          onClick={() => {}}
          isPrint
        />
      </ReportContext.Provider>,
    );

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
