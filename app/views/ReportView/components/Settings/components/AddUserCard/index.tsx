import React from 'react';
import {
  Button,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

import { useUser } from '@/context/UserContext';

import './index.scss';

type AddUserCardProps = {
  onAdd: () => void;
};

const AddUserCard = ({
  onAdd,
}: AddUserCardProps): JSX.Element => {
  const { canEdit } = useUser();

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
