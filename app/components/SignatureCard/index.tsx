import React, { useContext } from 'react';
import {
  Paper,
  Typography,
  IconButton,
  Button,
} from '@material-ui/core';
import GestureIcon from '@material-ui/icons/Gesture';
import RemoveCircleIcon from '@material-ui/icons/RemoveCircle';

import EditContext from '../EditContext';

import './index.scss';

const NON_BREAKING_SPACE = '\u00A0';

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
    <Paper elevation={2} className="signatures">
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
            <Button
              onClick={handleSign}
              variant="text"
              disableElevation
              startIcon={<GestureIcon />}
              color="inherit"
            >
              Sign
            </Button>
          </>
        )}
      </div>
      <div className="signatures__date">
        <Typography variant="body2">
          Date
        </Typography>
        {signature ? (
            <Typography>
              {signature.updatedAt
                ? signature.updatedAt
                : signature.createdAt}
            </Typography>
        ) : (
          <Typography>
            {NON_BREAKING_SPACE}
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
