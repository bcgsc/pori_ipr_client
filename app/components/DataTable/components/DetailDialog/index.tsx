import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import './index.scss';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import MuiAccordionSummary, { AccordionSummaryProps } from '@mui/material/AccordionSummary';
import { styled } from '@mui/material/styles';

const AccordionSummary = styled((props: AccordionSummaryProps) => (
  <MuiAccordionSummary
    expandIcon={(
      <ExpandMoreIcon />
    )}
    classes={{
      root: 'detail-dialog__row',
    }}
    {...props}
  />
))(() => ({
  minHeight: '1rem',
  '& .MuiAccordionSummary-content': {
    margin: 0,
  },
}));

const { compare } = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });

type PrimitiveAttributeProps = {
  keyString: string;
  value: string | number | null | undefined;
};
const PrimitiveAttribute = ({ keyString, value }: PrimitiveAttributeProps) => (
  <div className="detail-dialog__row">
    <Typography variant="subtitle2" display="inline">
      {`${keyString}: `}
    </Typography>
    <Typography variant="body2" display="inline">
      {`${value}` || 'null'}
    </Typography>
  </div>
);

type ObjectAttributesProps = {
  obj: object;
  objKey?: string;
  columnMapping: Record<string, string>;
  arrayKeyGetter?: Record<string, (val) => string>;
};

const ObjectAttributes = ({
  obj,
  objKey,
  columnMapping,
  arrayKeyGetter,
}: ObjectAttributesProps) => {
  if (obj === null || obj === undefined) {
    return null;
  }

  // === obj is Array ===
  if (Array.isArray(obj)) {
    const inner = obj.map((mappedVal, idx) => {
      const mappedValIsArray = Array.isArray(mappedVal);
      const rowKey = `${JSON.stringify(mappedVal)}-${idx}`;
      let arrayKey = String(idx);
      if (arrayKeyGetter && arrayKeyGetter[objKey]) {
        arrayKey = arrayKeyGetter[objKey](mappedVal);
      }

      // Value is primitive or null
      if (!mappedValIsArray && (typeof mappedVal !== 'object' || mappedVal === null)) {
        return (
          <div key={rowKey} className="detail-dialog__row">
            <Typography variant="subtitle2">
              {mappedVal || 'null'}
            </Typography>
          </div>
        );
      }

      // Value is Object
      return (
        // eslint-disable-next-line react/no-array-index-key
        <React.Fragment key={rowKey}>
          <Accordion
            disableGutters
            elevation={0}
            square
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
            >
              <Typography variant="subtitle2">
                {`${arrayKey}: ${mappedValIsArray ? '[' : '{'}`}
              </Typography>
            </AccordionSummary>
            <AccordionDetails
              style={{
                padding: 0,
              }}
            >
              <ObjectAttributes arrayKeyGetter={arrayKeyGetter} objKey={objKey} obj={mappedVal} columnMapping={columnMapping} />
              <div className="detail-dialog__row">
                <Typography variant="subtitle2">
                  {`${mappedValIsArray ? ']' : '}'}`}
                </Typography>
              </div>
            </AccordionDetails>
          </Accordion>
          <Divider />
        </React.Fragment>
      );
    });

    return (
      <div className="detail-dialog__inner-row">
        {inner}
      </div>
    );
  }

  // === obj is Object ===
  if (typeof obj === 'object') {
    const objLength = Object.keys(obj).length;

    // Order attributes by alphanumeric key, then render out each
    const inner = Object.entries(obj)
      .sort(([a], [b]) => compare(a, b))
      .map(([key, mappedVal], index) => {
        if (
          ['ident', 'svg', 'svgTitle', 'image'].includes(key)
          || mappedVal === null
          || mappedVal === undefined
        ) {
          return null;
        }

        const keyString = columnMapping[key] ?? key;
        const rowKey = `${key}${mappedVal}`;

        // Value is Primitive
        if (typeof mappedVal !== 'object') {
          return (
            <React.Fragment key={rowKey}>
              <PrimitiveAttribute keyString={keyString} value={mappedVal} />
              {index !== objLength - 1 && <Divider />}
            </React.Fragment>
          );
        }

        // Value is Object
        const mappedValIsArray = Array.isArray(mappedVal);
        return (
          <React.Fragment key={rowKey}>
            <div className="detail-dialog__row">
              <Typography variant="subtitle2">
                {`${keyString}: ${mappedValIsArray ? '[' : '{'}`}
              </Typography>
            </div>
            <ObjectAttributes arrayKeyGetter={arrayKeyGetter} obj={mappedVal} objKey={key} columnMapping={columnMapping} />
            <div className="detail-dialog__row">
              <Typography variant="subtitle2">
                {`${mappedValIsArray ? ']' : '}'}`}
              </Typography>
            </div>
            <Divider />
          </React.Fragment>
        );
      });

    // Top level render of object attributes
    return (
      <div className="detail-dialog__inner-row">
        {inner}
      </div>
    );
  }

  return null;
};

type DetailDialogProps = {
  onClose: (value: string) => void,
  selectedRow,
  isOpen: boolean,
  columnMapping?: Record<string, string>,
};

/**
 * @param {object} props props
 * @param {func} props.onClose callback function to run on close
 * @param {object} props.selectedRow row data for selected row
 * @param {bool} props.isOpen is the dialog open
 * @param {object} props.columnMapping mapping object for displayed col names
 * @return {*} jsx
 */
const DetailDialog = ({
  onClose,
  selectedRow,
  isOpen,
  columnMapping = {},
}: DetailDialogProps): JSX.Element => (
  <Dialog maxWidth="xl" fullWidth onClose={onClose} open={isOpen}>
    <DialogTitle>
      Detailed View
    </DialogTitle>
    <DialogContent>
      <ObjectAttributes
        obj={selectedRow}
        columnMapping={columnMapping}
        arrayKeyGetter={{
          kbMatches: ({ kbStatementId }) => kbStatementId,
          users: ({ username, firstName, lastName }) => username ?? `${firstName} ${lastName}`,
        }}
      />
    </DialogContent>
  </Dialog>
);

export default DetailDialog;
