import React, {
  useState, useCallback, useContext,
} from 'react';
import {
  Paper,
  Tooltip,
  Button,
  Divider,
  IconButton,
  Typography,
  TextField,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import { useSnackbar } from 'notistack';

import ReportContext from '@/context/ReportContext';
import useSecurity from '@/hooks/useSecurity';
import useResource from '@/hooks/useResource';
import api from '@/services/api';
import { formatDate } from '@/utils/date';
import CommentType from './types';

import './index.scss';

type CommentCardProps = {
  comment: CommentType;
  onSave: (newComment: CommentType) => void;
  onDelete: (ident: string) => void;
};

const CommentCard = ({
  comment,
  onSave,
  onDelete,
}: CommentCardProps): JSX.Element => {
  const { report } = useContext(ReportContext);
  const { userDetails } = useSecurity();
  const { adminAccess } = useResource();
  const snackbar = useSnackbar();

  const [isEditing, setIsEditing] = useState(false);
  const [editedComment, setEditedComment] = useState('');

  const handleEditStart = useCallback(() => {
    setEditedComment(comment?.body);
    setIsEditing(true);
  }, [comment?.body]);

  const handleDelete = useCallback(async () => {
    try {
      await api.del(
        `/reports/${report.ident}/presentation/discussion/${comment?.ident}`,
        {},
        {},
      ).request();
      onDelete(comment?.ident);
      snackbar.enqueueSnackbar('Comment deleted', { variant: 'success' });
    } catch (err) {
      snackbar.enqueueSnackbar(`Error deleting comment: ${err}`, { variant: 'error' });
    }
  }, [comment?.ident, onDelete, report, snackbar]);

  const handleEditTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEditedComment(event.target.value);
  };

  const handleEditSave = useCallback(async () => {
    try {
      const newComment = await api.put(
        `/reports/${report.ident}/presentation/discussion/${comment.ident}`,
        { body: editedComment },
        {},
      ).request();
      onSave(newComment);
      snackbar.enqueueSnackbar('Comment saved', { variant: 'success' });
    } catch (err) {
      snackbar.enqueueSnackbar(`Error saving comment: ${err}`, { variant: 'error' });
    } finally {
      setIsEditing(false);
    }
  }, [comment, report, snackbar, editedComment, onSave]);

  const handleEditCancel = useCallback(() => {
    setIsEditing(false);
    setEditedComment(comment?.body);
  }, [comment?.body]);

  return (
    <Paper className="comment-card" elevation={3} key={comment.ident}>
      <div className="comment-card__toolbar">
        <Typography display="inline" variant="caption">
          {`${comment.user.firstName} ${comment.user.lastName}`}
        </Typography>
        <Typography display="inline" variant="caption">
          {formatDate(comment.createdAt, true)}
          {comment.updatedAt !== comment.createdAt && (
            <Tooltip
              describeChild
              placement="right-end"
              title={`Edited on ${formatDate(comment.updatedAt, true)}`}
            >
              <span>
                *
              </span>
            </Tooltip>
          )}
        </Typography>
        <Typography display="inline" variant="caption">
          {(userDetails.username === comment.user.username || adminAccess) ? (
            <>
              <IconButton
                classes={{ root: 'comment-card__edit-icon' }}
                onClick={handleEditStart}
                size="small"
              >
                <EditIcon />
              </IconButton>
              <IconButton
                classes={{ root: 'comment-card__edit-icon' }}
                onClick={handleDelete}
                size="small"
              >
                <CloseIcon />
              </IconButton>
            </>
          ) : (
            <div>
              &nbsp;
            </div>
          )}
        </Typography>
      </div>
      <Divider />
      <div className="comment-card__body">
        {!isEditing ? (
          <Typography>
            {comment.body}
          </Typography>
        ) : (
          <div className="comment-card__edit">
            <TextField
              color="secondary"
              fullWidth
              multiline
              onChange={handleEditTextChange}
              value={editedComment}
              variant="outlined"
            />
            <Button color="secondary" onClick={handleEditSave}>Save</Button>
            <Button onClick={handleEditCancel}>Cancel</Button>
          </div>
        )}
      </div>
    </Paper>
  );
};

export default CommentCard;
