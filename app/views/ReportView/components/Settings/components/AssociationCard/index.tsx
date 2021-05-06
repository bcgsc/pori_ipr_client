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

import { UserType } from '@/common';
import startCase from '@/utils/startCase';
import EditContext from '@/components/EditContext';

import './index.scss';

type AssociationCardProps = {
  user: UserType;
  onDelete: (user: UserType, role: string) => void;
  role: string;
};

const AssociationCard = ({
  user,
  onDelete,
  role = '',
}: AssociationCardProps): JSX.Element => {
  const { canEdit } = useContext(EditContext);

  return (
    <Card className="association-card">
      <CardContent className="association-card__content">
        <div className="association-card__header">
          <Typography display="inline" variant="h4">{startCase(role)}</Typography>
          <PersonIcon className="association-card__icon" />
        </div>
        <Divider />
        <div className="association-card__body">
          <Typography variant="body1">
            {`${user.firstName} ${user.lastName}`}
          </Typography>
          <Typography variant="caption">
            {`${user.email}`}
          </Typography>
        </div>
      </CardContent>
      <CardActions className="association-card__actions">
        <Button
          color="secondary"
          disabled={!canEdit}
          onClick={() => onDelete(user, role)}
        >
          Remove
        </Button>
      </CardActions>
    </Card>
  );
};

export default AssociationCard;
