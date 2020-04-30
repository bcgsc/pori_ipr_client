import React from 'react';
import PropTypes from 'prop-types';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';

import './index.scss';

const { compare } = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });

/**
 * @param {object} props props
 * @param {func} props.onClose callback function to run on close
 * @param {object} props.selectedRow row data for selected row
 * @param {bool} props.open is the dialog open
 * @param {object} props.columnMapping mapping object for displayed col names
 * @return {*} jsx
 */
function DetailDialog(props) {
  const {
    onClose,
    selectedRow,
    open,
    columnMapping,
  } = props;

  const handleClose = (value) => {
    onClose(value);
  };

  const printRow = rows => Object.entries(rows)
    .sort(compare)
    .map(([key, value], index, rowEntries) => {
      if (key === 'ident' || value === null) {
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
              <>
                <div className="detail-dialog__inner-row">
                  {value.map(((arrVal, innerIndex) => (
                    // eslint-disable-next-line react/no-array-index-key
                    <React.Fragment key={innerIndex}>
                      {typeof arrVal === 'object' && arrVal !== null
                        ? (
                          <>
                            <Divider />
                            {printRow(arrVal)}
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
              </>
            ) : null}
            <div className="detail-dialog__row">
              <Typography variant="subtitle2" display="inline">
                {']'}
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
              {printRow(value)}
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
    <Dialog onClose={handleClose} open={open}>
      <DialogTitle>
        Detailed View
      </DialogTitle>
      <DialogContent>
        {printRow(selectedRow)}
      </DialogContent>
    </Dialog>
  );
}

DetailDialog.propTypes = {
  onClose: PropTypes.func.isRequired,
  selectedRow: PropTypes.objectOf(PropTypes.any).isRequired,
  open: PropTypes.bool.isRequired,
  columnMapping: PropTypes.objectOf(PropTypes.string),
};

DetailDialog.defaultProps = {
  columnMapping: {},
};

export default DetailDialog;
