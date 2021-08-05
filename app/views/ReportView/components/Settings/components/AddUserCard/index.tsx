import React from 'react';
import {
  Button,
} from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';

import { useEdit } from '@/context/EditContext';

import './index.scss';

type AddUserCardProps = {
  onAdd: () => void;
};

const AddUserCard = ({
  onAdd,
}: AddUserCardProps): JSX.Element => {
  const { canEdit } = useEdit();

  return (
    <div className="add-card">
      <Button
        className="add-card__button"
        color="secondary"
        disabled={!canEdit}
        onClick={() => onAdd()}
        variant="outlined"
      >
        <AddIcon />
        Add User
      </Button>
    </div>
  );
};

export default AddUserCard;
