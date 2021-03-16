import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

import EditContext from '@/components/EditContext';
import SignatureCard from '..';
import { mockNullData, mockNullObjectData, mockObjectData } from './mockData';

describe('SignatureCard', () => {
  test('Author and sign button are visible', async () => {
    render(
      <EditContext.Provider value={{ canEdit: true, setCanEdit: () => {} }}>
        <SignatureCard
          title="Author"
          type="author"
          signatures={null}
          onClick={() => {}}
        />
      </EditContext.Provider>,
    );
    expect(await screen.findByText('Author')).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: 'Sign' })).toBeInTheDocument();
  });

  test('Sign button is not visible without edit permissions', async () => {
    render(
      <EditContext.Provider value={{ canEdit: false, setCanEdit: () => {} }}>
        <SignatureCard
          title="Author"
          type="author"
          signatures={null}
          onClick={() => {}}
        />
      </EditContext.Provider>,
    );
    expect(screen.queryByRole('button', { name: 'Sign' })).not.toBeInTheDocument();
  });

  test('Sign button calls onClick', async () => {
    const handleClick = jest.fn();
    render(
      <EditContext.Provider value={{ canEdit: true, setCanEdit: () => {} }}>
        <SignatureCard
          title="Author"
          type="author"
          signatures={null}
          onClick={handleClick}
        />
      </EditContext.Provider>,
    );
    fireEvent.click(await screen.findByRole('button', { name: 'Sign' }));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test('Sign button is visible when reviewerSignature is null', async () => {
    render(
      <EditContext.Provider value={{ canEdit: true, setCanEdit: () => {} }}>
        <SignatureCard
          title="Reviewer"
          type="reviewer"
          signatures={mockNullData}
          onClick={() => {}}
        />
      </EditContext.Provider>,
    );

    expect(await screen.findByRole('button', { name: 'Sign' })).toBeInTheDocument();
  });

  test('Sign button is visible when reviewerSignature has null data', async () => {
    render(
      <EditContext.Provider value={{ canEdit: true, setCanEdit: () => {} }}>
        <SignatureCard
          title="Reviewer"
          type="reviewer"
          signatures={mockNullObjectData}
          onClick={() => {}}
        />
      </EditContext.Provider>,
    );

    expect(await screen.findByRole('button', { name: 'Sign' })).toBeInTheDocument();
  });

  test('Reviewer name & remove signature button are visible', async () => {
    render(
      <EditContext.Provider value={{ canEdit: true, setCanEdit: () => {} }}>
        <SignatureCard
          title="Reviewer"
          type="reviewer"
          signatures={mockObjectData}
          onClick={() => {}}
        />
      </EditContext.Provider>,
    );

    expect(screen.queryByRole('button', { name: 'Sign' })).not.toBeInTheDocument();
    expect(await screen.findByRole('button', { name: /^((?!Sign).)*$/ })).toBeInTheDocument();
  });

  test('No buttons are visible in print view', async () => {
    render(
      <EditContext.Provider value={{ canEdit: true, setCanEdit: () => {} }}>
        <SignatureCard
          title="Reviewer"
          type="reviewer"
          signatures={mockObjectData}
          onClick={() => {}}
          isPrint
        />
      </EditContext.Provider>,
    );

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
