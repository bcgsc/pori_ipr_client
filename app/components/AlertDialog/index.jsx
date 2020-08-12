import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  TextField,
} from '@material-ui/core';

const AlertDialog = (props) => {
  const {
    isOpen,
    onClose,
    title,
    text,
    commentRequired,
    confirmText,
    cancelText,
  } = props;

  const [commentInput, setCommentInput] = useState('');

  return (
    <Dialog open={isOpen} onClose={onClose}>
      <DialogTitle>
        {title}
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          {text}
        </DialogContentText>
        {commentRequired && (
          <TextField
            className="text-field-fix"
            value={commentInput}
            onChange={event => setCommentInput(event.target.value)}
            label="Comment"
            required
            fullWidth
            multiline
          />
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onClose(false)}>
          {cancelText}
        </Button>
        {Boolean(confirmText) && (
          <Button
            disabled={commentRequired && !commentInput}
            onClick={() => (commentRequired ? onClose(true, commentInput) : onClose(true))}
          >
            {confirmText}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

AlertDialog.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string,
  text: PropTypes.string.isRequired,
  confirmText: PropTypes.string,
  cancelText: PropTypes.string.isRequired,
  commentRequired: PropTypes.bool,
};

AlertDialog.defaultProps = {
  title: '',
  confirmText: '',
  commentRequired: false,
};

export default AlertDialog;
