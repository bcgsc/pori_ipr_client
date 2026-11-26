import React from 'react';
import {
	fireEvent,
	render,
	screen,
	waitFor,
	within,
} from '@testing-library/react';
import { QueryClient, QueryClientProvider } from 'react-query';

import ReportContext from '@/context/ReportContext';
import ConfirmContext from '@/context/ConfirmContext';
import KeyAlterations, { isValidNewGeneVariant, transformManualVariantToData } from '..';
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
					setIsSigned: () => { },
				}}
			>
				<KeyAlterations {...props as any} />
			</ConfirmContext.Provider>
		</ReportContext.Provider>
	</QueryClientProvider>,
);

describe('KeyAlterations', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		(api.get as jest.Mock).mockImplementation(() => ({
			request: async () => mockVariantsResponse,
		}));

		(ApiCallSet as unknown as jest.Mock).mockImplementation((calls) => ({
			request: async () => Promise.all(calls.map((call) => call.request())),
		}));
	});

	test.each([
		'germline MUTYH:c.934-2A>G',
		'germline TP53:p.V143fs',
		'germline TP53:g.123A>G',
		'TP53:p.V143fs',
		'FGFR1 (amplification)',
		'(YAP1,AHNAK):fusion(e.5,e.6)',
		'ERCC1 (decreased rna expression)',
		'  TP53:p.V143fs  ',
	])('accepts permitted notation: %s', (value) => {
		expect(isValidNewGeneVariant(value)).toBe(true);
	});

	test.each([
		'',
		'   ',
		'TP53',
		'TP53:p.',
		'TP53:V143fs',
		'germline :c.934-2A>G',
		'FGFR1 amplification',
		'FGFR1 ()',
		'FGFR1 (amplification',
		'EML4::ALK fusion',
		'(YAP1,):fusion(e.5,e.6)',
		'(YAP1,AHNAK):fusion(e.,e.6)',
		'(YAP1,AHNAK):fusion(e.5,e.6) extra',
		'TP53:p.V143fs\nFGFR1 (amplification)',
	])('rejects invalid notation: %s', (value) => {
		expect(isValidNewGeneVariant(value)).toBe(false);
	});

	test('blocks invalid submissions and clears the error after correcting the value', async () => {
		renderWithProviders({ isPrint: false });
		fireEvent.click(await screen.findByRole('button', { name: 'Add New Alteration' }));
		const input = screen.getByRole('textbox', { name: 'Gene Variant' });
		const addButton = screen.getByRole('button', { name: /^Add$/ });

		expect(addButton).toBeDisabled();
		fireEvent.change(input, { target: { value: 'TP53' } });
		expect(input).toHaveAttribute('aria-invalid', 'true');
		expect(screen.getByRole('alert')).toHaveTextContent('Enter an alteration using one of the patterns below.');
		fireEvent.click(addButton);
		expect(api.post).not.toHaveBeenCalled();

		(api.post as jest.Mock).mockReturnValue({
			request: async () => ({
				ident: 'new-variant',
				variantType: null,
				geneVariant: 'TP53:p.V143fs',
			}),
		});
		fireEvent.change(input, { target: { value: '  TP53:p.V143fs  ' } });
		expect(input).toHaveAttribute('aria-invalid', 'false');
		expect(screen.queryByRole('alert')).toBeNull();
		expect(addButton).toBeEnabled();
		fireEvent.click(addButton);
		await waitFor(() => {
			expect(api.post).toHaveBeenCalledWith(
				'/reports/report-123/summary/genomic-alterations-identified',
				{ geneVariant: 'TP53:p.V143fs' },
			);
			expect(screen.queryByRole('dialog')).toBeNull();
		});
	});

	test('renders title and tables in non-print mode', async () => {
		renderWithProviders({ isPrint: false });

		expect(await screen.findByText('Reported Genomic and Transcriptomic Alterations')).toBeInTheDocument();
		expect(screen.getByRole('button', { name: 'Add New Alteration' })).toBeInTheDocument();

		expect(screen.getByTestId('genomic-table-smallMutation')).toBeInTheDocument();
		expect(screen.getByTestId('genomic-table-cnv')).toBeInTheDocument();
		expect(screen.getByTestId('genomic-table-structuralVariant')).toBeInTheDocument();
		expect(screen.getByTestId('genomic-table-expression')).toBeInTheDocument();
	});

	test('parses bracketed fusion notation for manual structural variants', () => {
		const transformed = transformManualVariantToData({
			ident: 'manual-sv',
			geneVariant: '(BRAF,KIAA1549):fusion(e.9,e.16)',
			variantType: null,
		} as any);

		expect(transformed.type).toBe('structuralVariant');
		expect(transformed.variant.gene1.name).toBe('BRAF');
		expect(transformed.variant.gene2.name).toBe('KIAA1549');
		expect(transformed.variant.exon1).toBe('9');
		expect(transformed.variant.exon2).toBe('16');
	});

	test('hides add button in print mode', async () => {
		renderWithProviders({ isPrint: true, printVersion: 'standardLayout' });

		expect(await screen.findByText('Reported Genomic and Transcriptomic Alterations')).toBeInTheDocument();
		expect(screen.queryByRole('button', { name: 'Add New Alteration' })).toBeNull();
	});

	test('keeps title with first table in standard print layout wrapper', async () => {
		const { container } = renderWithProviders({ isPrint: true, printVersion: 'standardLayout' });

		await screen.findByText('Reported Genomic and Transcriptomic Alterations');

		const keepWrapper = container.querySelector('.key-alterations-print__printKeepWithFirstTable');
		expect(keepWrapper).toBeTruthy();

		const inKeepWrapper = within(keepWrapper as HTMLElement);
		expect(inKeepWrapper.getByText('Reported Genomic and Transcriptomic Alterations')).toBeInTheDocument();
		expect(inKeepWrapper.getByTestId('genomic-table-smallMutation')).toBeInTheDocument();
	});

	test('keeps title with first table in condensed print layout wrapper', async () => {
		const { container } = renderWithProviders({ isPrint: true, printVersion: 'condensedLayout' });

		await waitFor(() => {
			expect(screen.getByText('Reported Genomic and Transcriptomic Alterations')).toBeInTheDocument();
		});

		const keepWrapper = container.querySelector('.key-alterations-print__printKeepWithFirstTable');
		expect(keepWrapper).toBeTruthy();

		const inKeepWrapper = within(keepWrapper as HTMLElement);
		expect(inKeepWrapper.getByTestId('genomic-table-smallMutation')).toBeInTheDocument();
		expect(inKeepWrapper.queryByTestId('genomic-table-cnv')).toBeNull();
		expect(screen.getByTestId('genomic-table-cnv')).toBeInTheDocument();
	});
});
