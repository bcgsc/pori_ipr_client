import React, { useContext } from 'react';
import {
  Button,
  Card,
  CardActions,
  CardContent,
  Divider,
  Typography,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';

import { UserType, RecordDefaults } from '@/common';
import startCase from '@/utils/startCase';
import ReportContext from '@/context/ReportContext';
import useResource from '@/hooks/useResource';

import './index.scss';

type AssociationCardProps = {
  user: {
    user: UserType;
    role: string;
  } & RecordDefaults,
  onDelete: (role: string) => void;
};

const AssociationCard = ({
  user,
  onDelete,
}: AssociationCardProps): JSX.Element => {
  const { report } = useContext(ReportContext);
  let { reportEditAccess: canEdit } = useResource();
  if (report.state === 'completed') {
    canEdit = false;
  }

  return (
    <Card className="association-card">
      <CardContent className="association-card__content">
        <div className="association-card__header">
          <Typography display="inline" variant="h4">{startCase(user.role)}</Typography>
          <PersonIcon className="association-card__icon" />
        </div>
        <Divider />
        <div className="association-card__body">
          <Typography variant="body1">
            {`${user.user.firstName} ${user.user.lastName}`}
          </Typography>
          <Typography variant="caption">
            {`${user.user.email}`}
          </Typography>
        </div>
      </CardContent>
      <CardActions className="association-card__actions">
        <Button
          color="secondary"
          disabled={!canEdit}
          onClick={() => onDelete(user.ident)}
        >
          Remove
        </Button>
      </CardActions>
    </Card>
  );
};

export default AssociationCard;
