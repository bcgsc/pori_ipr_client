import React from 'react';
import { render, screen } from '@testing-library/react';

import LinkOutView from '..';

describe('LinkOutView', () => {
  test('shows a redirect error when the url has no graphkb segment', async () => {
    // jsdom's default location has no "/graphkb", so the redirect parsing fails and is handled
    render(<LinkOutView />);

    expect(
      await screen.findByText(/An error has occured redirecting to GraphKB/i),
    ).toBeInTheDocument();
  });
});
