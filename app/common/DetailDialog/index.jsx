import React from 'react';
import PropTypes from 'prop-types';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';

import './index.scss';

/**
 * @param {object} props props
 * @param {func} props.onClose callback function to run on close
 * @param {object} props.selectedRow row data for selected row
 * @param {bool} props.open is the dialog open
 * @param {array} props.arrayColumns list of columns containing array data
 * @return {*} jsx
 */
function DetailDialog(props) {
  const {
    onClose,
    selectedRow,
    open,
    arrayColumns,
  } = props;

  const handleClose = (value) => {
    onClose(value);
  };

  return (
    <Dialog onClose={handleClose} open={open}>
      <DialogTitle>
        Detailed View
      </DialogTitle>
      <DialogContent>
        {Object.entries(selectedRow).map(([key, value], index) => (
          <React.Fragment key={key}>
            {index > 0 && <Divider />}
            <Typography className="detail-dialog__row">
              {key}
              {': '}
              {arrayColumns.includes(key) && (
                <>
                  {[...value].sort().map((val, i) => (
                    <React.Fragment key={val}>
                      {val.replace('#', '')}
                      {i < value.size - 1 && ', '}
                    </React.Fragment>
                  ))}
                </>
              )}
              {!arrayColumns.includes(key) && (
                <>
                  {value}
                </>
              )}
            </Typography>
          </React.Fragment>
        ))}
      </DialogContent>
    </Dialog>
  );
}

DetailDialog.propTypes = {
  onClose: PropTypes.func.isRequired,
  selectedRow: PropTypes.objectOf(PropTypes.any).isRequired,
  open: PropTypes.bool.isRequired,
  arrayColumns: PropTypes.arrayOf(PropTypes.string),
};

DetailDialog.defaultProps = {
  arrayColumns: [],
};

export default DetailDialog;
