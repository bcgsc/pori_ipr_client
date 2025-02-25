import { screen, render } from '@testing-library/react';

import ArrayCellRenderer, { NCBI_API_LINK } from '..';

const mockData = {
  test: 'this is not an array',
};

const mockArrayData = {
  test: ['this is an array value', 'and another one'],
};

const mockLinkData = {
  test: 'http://crouton.net',
};

const mockPMIDArrayData = {
  test: ['pmid:640976409', 'pmid:36957970'],
};

const mockLinkArrayData = {
  test: ['crouton.net', 'eelslap.com'],
};

describe('ArrayCellRenderer', () => {
  test('A non-link string renders', async () => {
    render(ArrayCellRenderer('test', false)({ data: mockData }));

    expect(await screen.findByText(mockData.test)).toBeInTheDocument();
  });

  test('A non-link array renders the first sorted value', async () => {
    render(ArrayCellRenderer('test', false)({ data: mockArrayData }));

    expect(await screen.findByText(`${mockArrayData.test[1]}…`)).toBeInTheDocument();
    expect(screen.queryByText(mockArrayData.test[0])).toBeNull();
  });

  test('A string link renders', async () => {
    render(ArrayCellRenderer('test', true)({ data: mockLinkData }));

    expect(await screen.findByText(mockLinkData.test)).toBeInTheDocument();
  });

  test('An array of PMIDs renders the first sorted link', async () => {
    render(ArrayCellRenderer('test', true)({ data: mockPMIDArrayData }));

    const expectedPMID = mockPMIDArrayData.test[1].replace('pmid:', '');
    const unexpectedPMID = mockPMIDArrayData.test[0].replace('pmid:', '');
    const elem = await screen.findByText(expectedPMID);

    expect(elem).toHaveAttribute('href', `${NCBI_API_LINK}/${expectedPMID}`);
    expect(screen.queryByText(unexpectedPMID)).toBeNull();
  });

  test('An array of links renders the first sorted link', async () => {
    render(ArrayCellRenderer('test', true)({ data: mockLinkArrayData }));

    const elem = await screen.findByText(mockLinkArrayData.test[0]);

    expect(elem).toHaveAttribute('href', `${mockLinkArrayData.test[0]}`);
    expect(screen.queryByText(`${mockLinkArrayData.test[1]}`)).toBeNull();
  });
});
