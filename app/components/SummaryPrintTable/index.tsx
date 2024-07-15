import {
  Table, TableBody, TableCell, TableRow, Typography,
} from '@mui/material';
import { Dictionary } from 'lodash';
import React from 'react';

type SummaryPrintTableProps = {
  data: Array<Record<string, unknown>>;
  labelKey: string;
  valueKey: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  renderValue?: (value: any) => unknown;
};

const variantTypes = ['cnv', 'smallMutation', 'structuralVariant', 'expression'];

const variantToStrings: Dictionary<string> = {
  cnv: 'CNV',
  smallMutation: 'Small Mutation',
  structuralVariant: 'Structural Variant',
  expression: 'Expression Outlier',
};

const SummaryPrintTable = ({
  data,
  labelKey,
  valueKey,
  renderValue = null,
}: SummaryPrintTableProps) => (
  <Table padding="none" size="small">
    <TableBody>
      {data.filter((key) => (key.value !== null && key.value !== '')).map(({ [labelKey]: label, [valueKey]: value }) => (
        <TableRow key={`${label}${value}`}>
          <TableCell>
            <Typography variant="body2" fontWeight="bold">{variantTypes.includes(String(label)) ? `${variantToStrings[String(label)]}${Object.values(value).length > 1 ? 's' : ''}` : label}</Typography>
          </TableCell>
          <TableCell sx={{ paddingLeft: 1 }}>
            {renderValue ? renderValue(value) : value}
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
);

export default SummaryPrintTable;
