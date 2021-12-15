import React from 'react';
import { IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

type DeleteCellProps = {
  onDelete: () => void;
};

const DeleteCell = ({
  onDelete,
}: DeleteCellProps): JSX.Element => (
  <IconButton
    onClick={onDelete}
    size="small"
  >
    <DeleteIcon />
  </IconButton>
);

export default DeleteCell;
