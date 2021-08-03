import React from 'react';
import {
  render, screen, fireEvent, cleanup, act,
} from '@testing-library/react';

import ReportContext from '@/context/ReportContext';
import AddComment from '..';

const mockText = 'weather you can really use for everything you do';

jest.mock('@/services/api', () => ({
  post: () => ({ request: async () => ({ body: mockText }) }),
}));

jest.mock('notistack', () => ({
  __esmodule: true,
  default: 'snackbar',
  useSnackbar: jest.fn(() => ({ enqueueSnackbar: (msg, type) => null })),
}));

describe('AddComment', () => {
  beforeEach(jest.resetModules);

  afterEach(cleanup);

  test('Add button is disabled when no text is provided', async () => {
    render(
      <AddComment
        onAdd={() => {}}
      />,
    );
    expect(await screen.findByRole('button')).toBeDisabled();
  });

  test('onAdd is called with input text when the button is pressed', async () => {
    const onAdd = jest.fn();

    render(
      <ReportContext.Provider value={{ report: { ident: 'test' } }}>
        <AddComment
          onAdd={onAdd}
        />
      </ReportContext.Provider>,
    );

    fireEvent.change(await screen.findByRole('textbox'), { target: { value: mockText } });
    await act(async () => fireEvent.click(await screen.findByRole('button')));

    expect(onAdd).toHaveBeenCalledTimes(1);
    expect(onAdd).toHaveBeenCalledWith(expect.objectContaining({
      body: mockText,
    }));
  });
});
