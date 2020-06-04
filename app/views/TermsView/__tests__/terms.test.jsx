import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import Terms from '..';

test('Header is in document', async () => {
  const { getByText } = render(<Terms />);

  expect(getByText('IPR Terms of Use')).toBeInTheDocument();
});
