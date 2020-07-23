import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  Input,
} from '@material-ui/core';

const AlertDialog = (props) => {
  const {
    isOpen,
    handleClose,
    title,
    text,
    commentRequired,
    confirmText,
    cancelText,
  } = props;

  const [commentInput, setCommentInput] = useState('');

  return (
    <Dialog open={isOpen} onClose={handleClose}>
      <DialogTitle>
        {title}
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          {text}
        </DialogContentText>
        {commentRequired && (
          <Input
            autoFocus
            value={commentInput}
            onChange={event => setCommentInput(event.target.value)}
          />
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => handleClose(false)}>
          {cancelText}
        </Button>
        {Boolean(confirmText) && (
          <Button
            disabled={commentRequired && !commentInput}
            onClick={() => (commentRequired ? handleClose(true, commentInput) : handleClose(true))}
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
  handleClose: PropTypes.func.isRequired,
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
