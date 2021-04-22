import React from 'react';
import {
  Button, Typography,
} from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';

import './index.scss';

type AddUserCardProps = {
  onAdd: () => void;
};

const AddUserCard = ({
  onAdd,
}: AddUserCardProps): JSX.Element => (
  <Button
    className="add-card"
    color="secondary"
    fullWidth
    onClick={() => onAdd()}
    variant="outlined"
  >
    <AddIcon />
    <div>
      <Typography>Add User</Typography>
    </div>
  </Button>
);

export default AddUserCard;
