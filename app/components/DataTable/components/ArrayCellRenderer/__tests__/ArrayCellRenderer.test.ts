import { screen, render } from '@testing-library/react';
import { ICellRendererParams } from '@ag-grid-community/core';
import ArrayCellRenderer from '..';

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
    render(ArrayCellRenderer('test')({ data: mockData }));

    expect(await screen.findByText(mockData.test)).toBeInTheDocument();
  });

  test('A non-link array renders the first sorted value', async () => {
    render(ArrayCellRenderer('test')({ data: mockArrayData }));

    expect(await screen.findByText(`${mockArrayData.test[1]}…`)).toBeInTheDocument();
    expect(screen.queryByText(mockArrayData.test[0])).toBeNull();
  });

  test('A string link renders', async () => {
    render(ArrayCellRenderer('test', { isLink: true })({ data: mockLinkData }));

    expect(await screen.findByText(mockLinkData.test)).toBeInTheDocument();
  });

  test('An array of PMIDs renders the first sorted link', async () => {
    render(ArrayCellRenderer('test', { isLink: true })({ data: mockPMIDArrayData }));

    const expectedPMID = mockPMIDArrayData.test[1].replace('pmid:', '');
    const unexpectedPMID = mockPMIDArrayData.test[0].replace('pmid:', '');
    const elem = await screen.findByText(expectedPMID);

    expect(elem).toHaveAttribute('href', `https://ncbi.nlm.nih.gov/pubmed/${expectedPMID}`);
    expect(screen.queryByText(unexpectedPMID)).toBeNull();
  });

  test('An array of links renders the first sorted link', async () => {
    render(ArrayCellRenderer('test', { isLink: true })({ data: mockLinkArrayData }));

    const elem = await screen.findByText(mockLinkArrayData.test[0]);

    expect(elem).toHaveAttribute('href', `${mockLinkArrayData.test[0]}`);
    expect(screen.queryByText(`${mockLinkArrayData.test[1]}`)).toBeNull();
  });

  test('A non-link array filters out null and empty string values', async () => {
    render(ArrayCellRenderer('test')({ data: { test: ['valid value', null, ''] } }));

    expect(await screen.findByText('valid value')).toBeInTheDocument();
    expect(screen.queryByText('null')).toBeNull();
  });

  test('A link array filters out null and empty string values', async () => {
    render(ArrayCellRenderer('test', { isLink: true })({ data: { test: [null, '', 'crouton.net'] } }));

    expect(await screen.findByText('crouton.net')).toBeInTheDocument();
  });
});

const mockNode = { setRowHeight: jest.fn() } as unknown as ICellRendererParams['node'];
const mockApi = {
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  onRowHeightChanged: jest.fn(),
} as unknown as ICellRendererParams['api'];

describe('ArrayCellRenderer - allLinks option', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => { cb(0); return 0 as unknown as ReturnType<typeof requestAnimationFrame>; });
    jest.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('Renders all PMIDs as anchor tags, not just the first', async () => {
    const data = { test: ['pmid:640976409', 'pmid:36957970'] };
    render(ArrayCellRenderer('test', { isLink: true, allLinks: true })({ data, node: mockNode, api: mockApi }));

    const links = await screen.findAllByRole('link');
    expect(links).toHaveLength(2);
  });

  test('Renders links before non-links', async () => {
    const data = { test: ['plain text', 'pmid:12345678'] };
    const { container } = render(
      ArrayCellRenderer('test', { isLink: true, allLinks: true })({ data, node: mockNode, api: mockApi }),
    );

    const spans = container.querySelectorAll('span');
    const firstSpan = spans[0];
    expect(firstSpan.querySelector('a')).not.toBeNull();
  });

  test('Comma-separates items', async () => {
    const data = { test: ['pmid:12345678', 'pmid:87654321'] };
    const { container } = render(
      ArrayCellRenderer('test', { isLink: true, allLinks: true })({ data, node: mockNode, api: mockApi }),
    );

    expect(container.textContent).toMatch(', ');
  });

  test('Filters null and empty string values', async () => {
    const data = { test: ['pmid:12345678', null, '', 'plain text'] };
    const { container } = render(
      ArrayCellRenderer('test', { isLink: true, allLinks: true })({ data, node: mockNode, api: mockApi }),
    );

    const links = container.querySelectorAll('a');
    expect(links).toHaveLength(1);
    expect(container.textContent).not.toMatch('null');
    expect(container.textContent).toContain('plain text');
  });

  test('Registers and cleans up columnResized listener', async () => {
    const data = { test: ['pmid:12345678'] };
    const { unmount } = render(
      ArrayCellRenderer('test', { isLink: true, allLinks: true })({ data, node: mockNode, api: mockApi }),
    );

    expect(mockApi.addEventListener).toHaveBeenCalledWith('columnResized', expect.any(Function));
    unmount();
    expect(mockApi.removeEventListener).toHaveBeenCalledWith('columnResized', expect.any(Function));
  });
});
