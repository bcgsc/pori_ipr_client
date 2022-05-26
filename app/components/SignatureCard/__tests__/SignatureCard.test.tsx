import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

import UserContext from '@/context/UserContext';
import SignatureCard from '..';
import { mockNullData, mockNullObjectData, mockObjectData } from './mockData';

describe('SignatureCard', () => {
  test('Author and sign button are visible', async () => {
    render(
      <UserContext.Provider value={{ canEdit: true, setCanEdit: () => {} }}>
        <SignatureCard
          title="Author"
          type="author"
          signatures={null}
          onClick={() => {}}
        />
      </UserContext.Provider>,
    );
    expect(await screen.findByText('Author')).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: 'Sign' })).toBeInTheDocument();
  });

  test('Sign button is not visible without edit permissions', async () => {
    render(
      <UserContext.Provider value={{ canEdit: false, setCanEdit: () => {} }}>
        <SignatureCard
          title="Author"
          type="author"
          signatures={null}
          onClick={() => {}}
        />
      </UserContext.Provider>,
    );
    expect(screen.queryByRole('button', { name: 'Sign' })).not.toBeInTheDocument();
  });

  test('Sign button calls onClick', async () => {
    const handleClick = jest.fn();
    render(
      <UserContext.Provider value={{ canEdit: true, setCanEdit: () => {} }}>
        <SignatureCard
          title="Author"
          type="author"
          signatures={null}
          onClick={handleClick}
        />
      </UserContext.Provider>,
    );
    fireEvent.click(await screen.findByRole('button', { name: 'Sign' }));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test('Sign button is visible when reviewerSignature is null', async () => {
    render(
      <UserContext.Provider value={{ canEdit: true, setCanEdit: () => {} }}>
        <SignatureCard
          title="Reviewer"
          type="reviewer"
          signatures={mockNullData}
          onClick={() => {}}
        />
      </UserContext.Provider>,
    );

    expect(await screen.findByRole('button', { name: 'Sign' })).toBeInTheDocument();
  });

  test('Sign button is visible when reviewerSignature has null data', async () => {
    render(
      <UserContext.Provider value={{ canEdit: true, setCanEdit: () => {} }}>
        <SignatureCard
          title="Reviewer"
          type="reviewer"
          signatures={mockNullObjectData}
          onClick={() => {}}
        />
      </UserContext.Provider>,
    );

    expect(await screen.findByRole('button', { name: 'Sign' })).toBeInTheDocument();
  });

  test('Reviewer name & remove signature button are visible', async () => {
    render(
      <UserContext.Provider value={{ canEdit: true, setCanEdit: () => {} }}>
        <SignatureCard
          title="Reviewer"
          type="reviewer"
          signatures={mockObjectData}
          onClick={() => {}}
        />
      </UserContext.Provider>,
    );

    expect(screen.queryByRole('button', { name: 'Sign' })).not.toBeInTheDocument();
    expect(await screen.findByRole('button', { name: /^((?!Sign).)*$/ })).toBeInTheDocument();
  });

  test('No buttons are visible in print view', async () => {
    render(
      <UserContext.Provider value={{ canEdit: true, setCanEdit: () => {} }}>
        <SignatureCard
          title="Reviewer"
          type="reviewer"
          signatures={mockObjectData}
          onClick={() => {}}
          isPrint
        />
      </UserContext.Provider>,
    );

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
