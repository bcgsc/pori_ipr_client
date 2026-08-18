import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';

import CacheBuster from '..';

describe('CacheBuster', () => {
  afterEach(() => {
    delete (window as { caches?: unknown }).caches;
  });

  test('renders its children', () => {
    render(<CacheBuster><div>app content</div></CacheBuster>);

    expect(screen.getByText('app content')).toBeInTheDocument();
  });

  test('checks the cache store on mount', async () => {
    const keys = jest.fn().mockResolvedValue([]);
    (window as unknown as { caches: { keys: jest.Mock; delete: jest.Mock } }).caches = {
      keys,
      delete: jest.fn(),
    };

    render(<CacheBuster><div>app content</div></CacheBuster>);

    await waitFor(() => expect(keys).toHaveBeenCalled());
  });
});
