import React from 'react';
import { IconButton } from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete';

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
