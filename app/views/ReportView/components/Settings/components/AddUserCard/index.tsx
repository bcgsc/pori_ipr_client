import React from 'react';
import {
  Button,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

import useResource from '@/hooks/useResource';

import './index.scss';

type AddUserCardProps = {
  onAdd: () => void;
};

const AddUserCard = ({
  onAdd,
}: AddUserCardProps): JSX.Element => {
  const { reportEditAccess } = useResource();

  return (
    <div className="add-card">
      <Button
        className="add-card__button"
        color="secondary"
        disabled={!reportEditAccess}
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
