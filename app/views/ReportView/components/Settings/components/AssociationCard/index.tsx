import React, { useContext } from 'react';
import {
  Button,
  Card,
  CardActions,
  CardContent,
  Divider,
  Typography,
} from '@material-ui/core';
import PersonIcon from '@material-ui/icons/Person';

import { UserType, RecordDefaults } from '@/common';
import startCase from '@/utils/startCase';
import EditContext from '@/context/EditContext';

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
  const { canEdit } = useContext(EditContext);

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
