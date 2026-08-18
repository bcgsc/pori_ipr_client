import React from 'react';
import { render, screen } from '@testing-library/react';

import DemoDescription from '..';

describe('DemoDescription', () => {
  afterEach(() => {
    window._env_.IS_DEMO = false;
  });

  test('renders nothing when not in demo mode', () => {
    window._env_.IS_DEMO = false;
    const { container } = render(<DemoDescription>demo text</DemoDescription>);

    expect(container).toBeEmptyDOMElement();
  });

  test('renders the children in an info alert when in demo mode', () => {
    window._env_.IS_DEMO = true;
    render(<DemoDescription>demo text</DemoDescription>);

    expect(screen.getByText('demo text')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });
});
