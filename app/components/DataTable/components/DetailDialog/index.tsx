import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';

import './index.scss';

const { compare } = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });

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
}: DetailDialogProps): JSX.Element => {
  const renderRow = (rows) => Object.entries(rows)
    .sort(([a], [b]) => compare(a, b))
    .map(([key, value], index, rowEntries) => {
      if (['ident', 'svg', 'svgTitle', 'image'].includes(key) || value === null) {
        return null;
      }

      if (Array.isArray(value)) {
        return (
          <React.Fragment key={key}>
            <div className="detail-dialog__row">
              <Typography variant="subtitle2" display="inline">
                {`${columnMapping[key] || key}:  [`}
              </Typography>
            </div>
            {value.length ? (
              <div className="detail-dialog__inner-row">
                {value.map(((arrVal, innerIndex) => (
                  // eslint-disable-next-line react/no-array-index-key
                  <React.Fragment key={innerIndex}>
                    {typeof arrVal === 'object' && arrVal !== null
                      ? (
                        <>
                          <Divider />
                          {renderRow(arrVal)}
                        </>
                      )
                      : (
                        <Typography variant="body2">
                          {arrVal || 'null'}
                        </Typography>
                      )}
                  </React.Fragment>
                )))}
              </div>
            ) : null}
            <div className="detail-dialog__row">
              <Typography variant="subtitle2" display="inline">
                ]
              </Typography>
            </div>
            <Divider />
          </React.Fragment>
        );
      }

      if (typeof value === 'object' && value !== null) {
        return (
          <React.Fragment key={key}>
            <div className="detail-dialog__row">
              <Typography variant="subtitle2">
                {`${columnMapping[key] || key}:  {`}
              </Typography>
            </div>
            <div className="detail-dialog__inner-row">
              {renderRow(value)}
            </div>
            <div className="detail-dialog__row">
              <Typography variant="subtitle2">
                {'}'}
              </Typography>
            </div>
            <Divider />
          </React.Fragment>
        );
      }

      return (
        <React.Fragment key={key}>
          <div className="detail-dialog__row">
            <Typography variant="subtitle2" display="inline">
              {`${columnMapping[key] || key}: `}
            </Typography>
            <Typography variant="body2" display="inline">
              {`${value}` || 'null'}
            </Typography>
          </div>
          {index !== rowEntries.length - 1 && <Divider />}
        </React.Fragment>
      );
    });

  return (
    <Dialog onClose={onClose} open={isOpen}>
      <DialogTitle>
        Detailed View
      </DialogTitle>
      <DialogContent>
        {renderRow(selectedRow)}
      </DialogContent>
    </Dialog>
  );
};

export default DetailDialog;
