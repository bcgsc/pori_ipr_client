import React from 'react';
import {
  render, screen, fireEvent, cleanup, act,
} from '@testing-library/react';

import ReportContext from '@/components/ReportContext';
import UploadSlide from '..';

const mockInputText = 'Sunday Television';
const mockFileContent = `What would you say about an idea that's so new and so 
innovative that up until now it's never even had a name? Well you're about to 
discover a brand new invention in the world of fishing!`;

jest.mock('@/services/api', () => ({
  post: () => ({ request: async () => ({ name: mockInputText, data: mockFileContent }) }),
}));

jest.mock('notistack', () => ({
  __esmodule: true,
  default: 'snackbar',
  useSnackbar: jest.fn(() => ({ enqueueSnackbar: (msg, type) => null })),
}));

describe('UploadSlide', () => {
  beforeEach(jest.resetModules);

  afterEach(cleanup);

  test('Button is disabled when file name is empty', async () => {
    render(
      <UploadSlide
        onUpload={() => {}}
      />,
    );
    expect(await screen.findByRole('button')).toHaveClass('Mui-disabled');
  });

  test('Button is enabled when file name is available', async () => {
    render(
      <UploadSlide
        onUpload={() => {}}
      />,
    );
    await act(async () => fireEvent.change(
      await screen.findByRole('textbox'), { target: { value: mockInputText } },
    ));
    expect(await screen.findByRole('button')).not.toHaveClass('Mui-disabled');
  });

  test('An error is shown and onUpload is not called when the file is not an image', async () => {
    const onUpload = jest.fn();
    const mockFileName = 'Sunday_Television.txt';
    render(
      <UploadSlide
        onUpload={onUpload}
      />,
    );

    await act(async () => fireEvent.change(
      await screen.findByRole('textbox'), { target: { value: mockInputText } },
    ));
    await act(async () => fireEvent.change(
      await screen.findByTestId('upload-slide__input'), {
        target: {
          files: [new File([mockFileContent], mockFileName, { type: 'text/html' })],
        },
      },
    ));

    expect(onUpload).not.toHaveBeenCalled();
    expect(
      await screen.findByText('Please select a valid image (.jpg/.jpeg/.png/.gif)'),
    ).toBeInTheDocument();
  });

  test('onUpload is called when the file is an image', async () => {
    const onUpload = jest.fn();
    const mockFileName = 'Sunday_Television.png';
    const uploadFile = new File([mockFileContent], mockFileName, { type: 'image/png' });

    render(
      <ReportContext.Provider value={{ report: { ident: '2225ea-ef27' } }}>
        <UploadSlide
          onUpload={onUpload}
        />
      </ReportContext.Provider>,
    );

    await act(async () => fireEvent.change(
      await screen.findByRole('textbox'), { target: { value: mockInputText } },
    ));
    await act(async () => fireEvent.change(
      await screen.findByTestId('upload-slide__input'), {
        target: {
          files: [uploadFile],
        },
      },
    ));

    expect(onUpload).toHaveBeenCalledTimes(1);
    expect(onUpload).toHaveBeenCalledWith(expect.objectContaining({
      name: mockInputText,
      data: mockFileContent,
    }));
  });
});
