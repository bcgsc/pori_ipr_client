import React from 'react';
import {
	render,
	screen,
	waitFor,
	within,
} from '@testing-library/react';
import { QueryClient, QueryClientProvider } from 'react-query';

import ReportContext from '@/context/ReportContext';
import ConfirmContext from '@/context/ConfirmContext';
import KeyAlterations from '..';
import api, { ApiCallSet } from '@/services/api';

jest.mock('@/services/api', () => {
	const mockGet = jest.fn();
	const mockPost = jest.fn();
	const mockDel = jest.fn();
	const mockPut = jest.fn();

	return {
		__esModule: true,
		default: {
			get: mockGet,
			post: mockPost,
			del: mockDel,
			put: mockPut,
		},
		ApiCall: jest.fn(),
		ApiCallSet: jest.fn(),
	};
});
jest.mock('@/services/SnackbarUtils');

jest.mock('../../VariantCounts', () => (props) => (
	<div data-testid="variant-counts">VariantCounts {props.filter || 'all'}</div>
));

jest.mock('../../GenomicAlterationsTable', () => (props) => (
	<div data-testid={`genomic-table-${props.variantCategory}`}>
		{props.variantCategory}
	</div>
));

const mockReport = {
	ident: 'report-123',
	template: {
		name: 'genomic',
	},
};

const mockVariantsResponse = [
	{
		ident: 'v1',
		variantType: 'mut',
		geneVariant: 'TP53:c.743G>A',
		variant: { gene: { name: 'TP53' } },
	},
	{
		ident: 'v2',
		variantType: 'cnv',
		geneVariant: 'MYC amplification',
		variant: { gene: { name: 'MYC' } },
	},
	{
		ident: 'v3',
		variantType: 'sv',
		geneVariant: 'EML4::ALK fusion',
		variant: { gene1: { name: 'EML4' }, gene2: { name: 'ALK' } },
	},
	{
		ident: 'v4',
		variantType: 'exp',
		geneVariant: 'EGFR expression outlier',
		variant: { gene: { name: 'EGFR' } },
	},
];

const renderWithProviders = (props = {}) => render(
	<QueryClientProvider
		client={new QueryClient({
			defaultOptions: { queries: { retry: false } },
		})}
	>
		<ReportContext.Provider
			value={{
				report: mockReport as any,
				canEdit: true,
				reportTemplateName: '',
				refetchReport: () => null,
			}}
		>
			<ConfirmContext.Provider
				value={{
					isSigned: false,
					setIsSigned: () => {},
				}}
			>
				<KeyAlterations {...props as any} />
			</ConfirmContext.Provider>
		</ReportContext.Provider>
	</QueryClientProvider>,
);

describe('KeyAlterations', () => {
	beforeEach(() => {
		(api.get as jest.Mock).mockImplementation(() => ({
			request: async () => mockVariantsResponse,
		}));

		(ApiCallSet as unknown as jest.Mock).mockImplementation((calls) => ({
			request: async () => Promise.all(calls.map((call) => call.request())),
		}));
	});

	test('renders title and tables in non-print mode', async () => {
		renderWithProviders({ isPrint: false });

		expect(await screen.findByText('Genomic and Transcriptomic Alterations Identified')).toBeInTheDocument();
		expect(screen.getByRole('button', { name: 'Add New Alteration' })).toBeInTheDocument();

		expect(screen.getByTestId('genomic-table-smallMutation')).toBeInTheDocument();
		expect(screen.getByTestId('genomic-table-cnv')).toBeInTheDocument();
		expect(screen.getByTestId('genomic-table-structuralVariant')).toBeInTheDocument();
		expect(screen.getByTestId('genomic-table-expression')).toBeInTheDocument();
	});

	test('hides add button in print mode', async () => {
		renderWithProviders({ isPrint: true, printVersion: 'standardLayout' });

		expect(await screen.findByText('Genomic and Transcriptomic Alterations Identified')).toBeInTheDocument();
		expect(screen.queryByRole('button', { name: 'Add New Alteration' })).toBeNull();
	});

	test('keeps title with first table in standard print layout wrapper', async () => {
		const { container } = renderWithProviders({ isPrint: true, printVersion: 'standardLayout' });

		await screen.findByText('Genomic and Transcriptomic Alterations Identified');

		const keepWrapper = container.querySelector('.key-alterations-print__printKeepWithFirstTable');
		expect(keepWrapper).toBeTruthy();

		const inKeepWrapper = within(keepWrapper as HTMLElement);
		expect(inKeepWrapper.getByText('Genomic and Transcriptomic Alterations Identified')).toBeInTheDocument();
		expect(inKeepWrapper.getByTestId('genomic-table-smallMutation')).toBeInTheDocument();
	});

	test('keeps title with first table in condensed print layout wrapper', async () => {
		const { container } = renderWithProviders({ isPrint: true, printVersion: 'condensedLayout' });

		await waitFor(() => {
			expect(screen.getByText('Genomic and Transcriptomic Alterations Identified')).toBeInTheDocument();
		});

		const keepWrapper = container.querySelector('.key-alterations-print__printKeepWithFirstTable');
		expect(keepWrapper).toBeTruthy();

		const inKeepWrapper = within(keepWrapper as HTMLElement);
		expect(inKeepWrapper.getByTestId('genomic-table-smallMutation')).toBeInTheDocument();
		expect(inKeepWrapper.queryByTestId('genomic-table-cnv')).toBeNull();
		expect(screen.getByTestId('genomic-table-cnv')).toBeInTheDocument();
	});
});
