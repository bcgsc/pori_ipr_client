import React, { useCallback, useState } from 'react';
import {
  Dialog,
  DialogProps,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  TextField,
} from '@mui/material';

interface AlertDialogProps extends Omit<DialogProps, 'open'> {
  isOpen: boolean;
  onClose: (confirmed: boolean, commentInput?: string) => void;
  title: string;
  text: string;
  commentRequired?: boolean;
  confirmText?: string;
  cancelText?: string;
};

const AlertDialog = ({
  isOpen,
  onClose,
  title,
  text,
  commentRequired = false,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
}: AlertDialogProps): JSX.Element => {
  const [commentInput, setCommentInput] = useState('');

  const handleClose = useCallback<DialogProps['onClose']>((evt, _reason) => {
    if (typeof evt === 'boolean') {
      onClose(evt);
      return;
    }
    onClose(false);
  }, [onClose])

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
          <TextField
            value={commentInput}
            onChange={(event) => setCommentInput(event.target.value)}
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

export default AlertDialog;
