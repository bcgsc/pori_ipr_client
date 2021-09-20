import React from 'react';
import { render, screen } from '@testing-library/react';

import withLoading from '..';

const mockComponent = () => (<></>);

describe('withLoading', () => {
  test('Props are applied to the component', async () => {
    const mockComponentSpy = jest.fn(mockComponent);
    const Component = withLoading(mockComponentSpy);

    render(<Component />);

    expect(mockComponentSpy).toHaveBeenCalled();
    expect(mockComponentSpy).toHaveBeenCalledWith(
      {
        isLoading: true,
        setIsLoading: expect.any(Function),
      },
      {},
    );
  });

  test('The loading indicator is shown', async () => {
    const Component = withLoading(mockComponent);

    render(<Component />);

    expect(await screen.findByRole('progressbar')).toBeInTheDocument();
  });
});
