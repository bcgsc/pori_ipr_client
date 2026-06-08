import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

import FrontPageTooltip from '..';

describe('FrontPageTooltip', () => {
  test('renders the indicator icon', () => {
    render(<FrontPageTooltip />);

    expect(screen.getByTestId('FlareIcon')).toBeInTheDocument();
  });

  test('shows the explanatory tooltip on hover', async () => {
    render(<FrontPageTooltip />);

    fireEvent.mouseOver(screen.getByTestId('FlareIcon'));

    expect(await screen.findByText('This field is shown on the front page')).toBeInTheDocument();
  });
});
