import React from 'react';
import { render } from '@testing-library/react';

import Terms from '..';

describe('Terms Component', () => {
  test('Header text is in the document', async () => {
    const { getByText } = render(<Terms />);

    expect(getByText('IPR Terms of Use')).toBeInTheDocument();
  });
});
