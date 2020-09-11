import React, { useContext } from 'react';
import {
  Paper,
  Typography,
  IconButton,
} from '@material-ui/core';
import GestureIcon from '@material-ui/icons/Gesture';
import RemoveCircleIcon from '@material-ui/icons/RemoveCircle';

import EditContext from '../EditContext';

import './index.scss';

type Props = {
  title: string,
  signature: any | object,
  onClick: Function,
  role: 'author' | 'reviewer',
};

const SignatureCard: React.FC<Props> = ({
  title,
  signature,
  onClick,
  role,
}) => {
  const { canEdit } = useContext(EditContext);

  const handleSign = () => {
    if (signature) {
      onClick(false, role);
    } else {
      onClick(true, role)
    }
  };

  return (
    <Paper elevation={3} className="signatures">
      <div className="signatures__name">
        <Typography variant="body2">
          {title}
        </Typography>
        {signature && (
          <Typography>
            {signature.firstName}
            {' '}
            {signature.lastName}
          </Typography>
        )}
        {!signature && canEdit && (
          <>
            <IconButton size="small" onClick={handleSign}>
              <GestureIcon />
            </IconButton>
            <Typography display="inline">
              Sign
            </Typography>
          </>
        )}
      </div>
      <div className="signatures__date">
        <Typography variant="body2">
          Date
        </Typography>
        {signature && (
            <Typography>
              {signature.updatedAt
                ? signature.updatedAt
                : signature.createdAt}
            </Typography>
        )}
      </div>
      {signature && canEdit && (
        <div className="signatures__button">
          <IconButton
            size="small"
            onClick={handleSign}
          >
            <RemoveCircleIcon />
          </IconButton>
        </div>
      )}
    </Paper>
  );
};

export default SignatureCard;
