import React from 'react';
import {
  render, screen, fireEvent, cleanup, act,
} from '@testing-library/react';

import ReportContext from '@/context/ReportContext';
import SecurityContext from '@/context/SecurityContext';
import { formatDate } from '@/utils/date';
import CommentCard from '..';

const mockComment = {
  ident: '012ee-eeoo2',
  updatedAt: null,
  createdAt: '2021-04-08T22:22:40.485Z',
  body: 'this is a mocked comment',
  user: {
    username: 'sspence',
    firstName: 'Skylar',
    lastName: 'Spence',
    createdAt: '2021-01-08T22:22:40.485Z',
    updatedAt: null,
    email: 'sspence@mail.ca',
    lastLogin: '2021-22-08T22:22:40.485Z',
    type: 'bcgsc',
    ident: '2636eeaa-657',
  },
};

const mockEditedText = 'edited value';

jest.mock('@/services/api', () => ({
  post: () => ({ request: async () => ({ body: '' }) }),
  del: () => ({ request: async () => {} }),
  put: () => ({ request: async () => ({ body: mockEditedText }) }),
}));

jest.mock('notistack', () => ({
  __esmodule: true,
  default: 'snackbar',
  useSnackbar: jest.fn(() => ({ enqueueSnackbar: (msg, type) => null })),
}));

describe('CommentCard', () => {
  beforeEach(jest.resetModules);

  afterEach(cleanup);

  test('Provided comment body is rendered', async () => {
    render(
      <CommentCard
        comment={mockComment}
        onSave={() => {}}
        onDelete={() => {}}
      />,
    );
    expect(await screen.findByText(mockComment.body)).toBeInTheDocument();
  });

  test('User and date appear in the card', async () => {
    render(
      <CommentCard
        comment={mockComment}
        onSave={() => {}}
        onDelete={() => {}}
      />,
    );
    expect(
      await screen.findByText(`${mockComment.user.firstName} ${mockComment.user.lastName}`),
    ).toBeInTheDocument();
    expect(
      await screen.findByText(formatDate(mockComment.createdAt, true)),
    ).toBeInTheDocument();
  });

  test('updatedAt time is shown if available', async () => {
    const mockCommentUpdated = mockComment;
    mockCommentUpdated.updatedAt = '2021-12-08T22:22:40.485Z';

    render(
      <CommentCard
        comment={mockCommentUpdated}
        onSave={() => {}}
        onDelete={() => {}}
      />,
    );
    expect(
      await screen.findByTitle(`Edited on ${formatDate(mockComment.updatedAt, true)}`),
    ).toBeInTheDocument();
  });

  test('Actions are hidden if the user is not matching', () => {
    render(
      <SecurityContext.Provider value={{ userDetails: { username: 'hwilliams' } }}>
        <CommentCard
          comment={mockComment}
          onSave={() => {}}
          onDelete={() => {}}
        />
      </SecurityContext.Provider>,
    );
    expect(screen.queryAllByRole('button')).toHaveLength(0);
  });

  test('Actions are shown if the user is matching', () => {
    render(
      <SecurityContext.Provider value={{ userDetails: { username: 'sspence' } }}>
        <CommentCard
          comment={mockComment}
          onSave={() => {}}
          onDelete={() => {}}
        />
      </SecurityContext.Provider>,
    );
    expect(screen.queryAllByRole('button')).toHaveLength(2);
  });

  test('Clicking the delete icon calls onDelete', async () => {
    const mockDelete = jest.fn();

    render(
      <ReportContext.Provider value={{ report: { ident: 'eeee' } }}>
        <SecurityContext.Provider value={{ userDetails: { username: 'sspence' } }}>
          <CommentCard
            comment={mockComment}
            onSave={() => {}}
            onDelete={mockDelete}
          />
        </SecurityContext.Provider>
      </ReportContext.Provider>,
    );
    await act(async () => fireEvent.click(screen.queryAllByRole('button')[1]));
    expect(mockDelete).toHaveBeenCalledTimes(1);
    expect(mockDelete).toHaveBeenCalledWith(mockComment.ident);
  });

  test('Clicking the edit icon starts edit mode', async () => {
    render(
      <SecurityContext.Provider value={{ userDetails: { username: 'sspence' } }}>
        <CommentCard
          comment={mockComment}
          onSave={() => {}}
          onDelete={() => {}}
        />
      </SecurityContext.Provider>,
    );
    await act(async () => fireEvent.click(screen.queryAllByRole('button')[0]));
    expect(await screen.findByRole('textbox')).toBeInTheDocument();
  });

  test('Cancelling edit mode does not save the value', async () => {
    const onSave = jest.fn();

    render(
      <SecurityContext.Provider value={{ userDetails: { username: 'sspence' } }}>
        <CommentCard
          comment={mockComment}
          onSave={onSave}
          onDelete={() => {}}
        />
      </SecurityContext.Provider>,
    );
    await act(async () => fireEvent.click(screen.queryAllByRole('button')[0]));
    await act(async () => fireEvent.change(
      await screen.findByRole('textbox'), { target: { value: mockEditedText } },
    ));
    await act(async () => fireEvent.click(await screen.findByRole('button', { name: 'Cancel' })));

    expect(screen.queryByRole('textbox')).toBeNull();
    expect(screen.queryByText(mockEditedText)).toBeNull();
    expect(await screen.findByText(mockComment.body)).toBeInTheDocument();
    expect(onSave).not.toHaveBeenCalled();
  });

  test('Clicking save in edit mode calls onSave with new text', async () => {
    const onSave = jest.fn();

    render(
      <ReportContext.Provider value={{ report: { ident: 'eeee' } }}>
        <SecurityContext.Provider value={{ userDetails: { username: 'sspence' } }}>
          <CommentCard
            comment={mockComment}
            onSave={onSave}
            onDelete={() => {}}
          />
        </SecurityContext.Provider>
      </ReportContext.Provider>,
    );
    await act(async () => fireEvent.click(screen.queryAllByRole('button')[0]));
    await act(async () => fireEvent.change(
      await screen.findByRole('textbox'), { target: { value: mockEditedText } },
    ));
    await act(async () => fireEvent.click(await screen.findByRole('button', { name: 'Save' })));

    expect(screen.queryByRole('textbox')).toBeNull();
    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({
      body: mockEditedText,
    }));
  });
});
