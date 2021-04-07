import React, { useState, useCallback, useContext } from 'react';
import {
  TextField,
  Button,
} from '@material-ui/core';
import { useSnackbar } from 'notistack';

import api from '@/services/api';
import ReportContext from '@/components/ReportContext';

import './index.scss';

type AddCommentProps = {
  onAdd: (newComment) => void;
};

const AddComment = ({
  onAdd,
}: AddCommentProps): JSX.Element => {
  const { report } = useContext(ReportContext);
  const snackbar = useSnackbar();

  const [comment, setComment] = useState('');

  const handleCommentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setComment(event.target.value);
  };

  const handleAddComment = useCallback(async () => {
    try {
      const newComment = await api.post(
        `/reports/${report.ident}/presentation/discussion`,
        { body: comment },
        {},
      ).request();
      snackbar.enqueueSnackbar('Comment added', { variant: 'success' });
      onAdd(newComment);
      setComment('');
    } catch (err) {
      snackbar.enqueueSnackbar(`Error adding comment: ${err}`, { variant: 'error' });
    }
  }, [comment, report, snackbar, onAdd]);

  return (
    <div className="add-comments">
      <TextField
        color="secondary"
        fullWidth
        label="Comment/Reply"
        multiline
        onChange={handleCommentChange}
        value={comment}
        variant="outlined"
      />
      <Button
        color="secondary"
        disabled={!comment}
        onClick={handleAddComment}
        variant="outlined"
      >
        Add
      </Button>
    </div>
  );
};

export default AddComment;
