import {
  Table, TableCell, TableRow, Typography,
} from '@mui/material';
import React from 'react';

type SummaryPrintTableProps = {
  data: Array<Record<string, unknown>>;
  labelKey: string;
  valueKey: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  renderValue?: (value: any) => unknown;
};

const SummaryPrintTable = ({
  data,
  labelKey,
  valueKey,
  renderValue = null,
}: SummaryPrintTableProps) => (
  <Table padding="none" size="small">
    {data.filter((key) => (key.value !== null && key.value !== '')).map(({ [labelKey]: label, [valueKey]: value }) => (
      <TableRow>
        <TableCell><Typography variant="body2" fontWeight="bold">{label}</Typography></TableCell>
        <TableCell sx={{ paddingLeft: 1 }}>
          {renderValue ? renderValue(value) : value}
        </TableCell>
      </TableRow>
    ))}
  </Table>
);

export default SummaryPrintTable;
