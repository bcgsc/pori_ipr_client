import React from 'react';
import {
	render,
	screen,
	waitFor,
} from '@testing-library/react';

import GenomicAlterationsTable from '..';

const mockDataTable = jest.fn();
const mockPrintTable = jest.fn();

jest.mock('@/components/DataTable', () => (props) => {
	mockDataTable(props);
	return <div data-testid="data-table">{props.titleText || 'data-table'}</div>;
});

jest.mock('@/components/PrintTable', () => (props) => {
	mockPrintTable(props);
	return <div data-testid="print-table">print-table</div>;
});

describe('GenomicAlterationsTable', () => {
	beforeEach(() => {
		mockDataTable.mockClear();
		mockPrintTable.mockClear();
	});

	test('renders DataTable for smallMutation in non-print mode', async () => {
		render(
			<GenomicAlterationsTable
				variantCategory="smallMutation"
				variantData={[{ ident: 'v1', gene: { name: 'TP53' } } as any]}
				isPrint={false}
			/>,
		);

		expect(await screen.findByTestId('data-table')).toBeInTheDocument();
		expect(screen.getByText('Small Mutations')).toBeInTheDocument();

		expect(mockDataTable).toHaveBeenCalled();
		const dataTableProps = mockDataTable.mock.calls[0][0];
		expect(dataTableProps.isPrint).toBe(false);
		expect(dataTableProps.canExport).toBe(true);
		expect(dataTableProps.titleText).toBe('Small Mutations');

		expect(mockPrintTable).not.toHaveBeenCalled();
	});

	test('renders PrintTable for smallMutation in print mode', async () => {
		render(
			<GenomicAlterationsTable
				variantCategory="smallMutation"
				variantData={[{ ident: 'v1', gene: { name: 'TP53' } } as any]}
				isPrint
			/>,
		);

		expect(await screen.findByTestId('print-table')).toBeInTheDocument();
		expect(screen.getByText('Small Mutations')).toBeInTheDocument();

		expect(mockPrintTable).toHaveBeenCalled();
		expect(mockDataTable).not.toHaveBeenCalled();
	});

	test('uses flattened expression print columns and excludes Actions', async () => {
		render(
			<GenomicAlterationsTable
				variantCategory="expression"
				variantData={[{ ident: 'v1', gene: { name: 'EGFR', copyVariants: { cnvState: 'gain' } } } as any]}
				isPrint
			/>,
		);

		await screen.findByTestId('print-table');

		const printTableProps = mockPrintTable.mock.calls[0][0];
		const printHeaders = printTableProps.columnDefs.map((col) => col.headerName);

		expect(printHeaders).toContain('Gene');
		expect(printHeaders).toContain('Expression Class');
		expect(printHeaders).toContain('Disease Perc');
		expect(printHeaders).toContain('Disease Z-Score');
		expect(printHeaders).not.toContain('Actions');
		expect(printTableProps.fullWidth).toBe(true);
	});

	test('shows loader and no tables for unknown variantCategory', async () => {
		render(
			<GenomicAlterationsTable
				variantCategory="unknown"
				variantData={[] as any}
				isPrint={false}
			/>,
		);

		await waitFor(() => {
			expect(screen.getByRole('progressbar')).toBeInTheDocument();
		});

		expect(mockDataTable).not.toHaveBeenCalled();
		expect(mockPrintTable).not.toHaveBeenCalled();
	});
});
