import React, { useContext } from 'react';
import {
  Button,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ReportContext from '@/context/ReportContext';
import useResource from '@/hooks/useResource';

import './index.scss';

type AddUserCardProps = {
  onAdd: () => void;
};

const AddUserCard = ({
  onAdd,
}: AddUserCardProps): JSX.Element => {
  const { report } = useContext(ReportContext);
  let { reportEditAccess: canEdit } = useResource();
  if (report.state === 'completed') {
    canEdit = false;
  }

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
