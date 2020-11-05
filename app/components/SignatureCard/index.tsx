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
  isPrint: boolean,
};

const SignatureCard: React.FC<Props> = ({
  title,
  signature,
  onClick,
  role,
  isPrint,
}) => {
  const { canEdit } = useContext(EditContext);

  const handleSign = () => {
    onClick(true, role);
  };

  const handleRevoke = () => {
    onClick(false, role);
  };

  if (isPrint) {
    return (
      <span className="signatures-print__group">
        <div className="signatures-print__value">
          <Typography variant="body2" display="inline">
            {`${title}: `}
          </Typography>
          {signature && signature.ident ? (
            <Typography variant="body2" display="inline">
              {signature.firstName}
              {' '}
              {signature.lastName}
            </Typography>
          ) : (
            <Typography variant="body2" display="inline">
              Not yet reviewed
            </Typography>
          )}
        </div>
        <div className="signatures-print__value">
          <Typography variant="body2" display="inline">
            {'Date: '}
          </Typography>
          {signature && signature.ident ? (
            <Typography variant="body2" display="inline">
              {signature.updatedAt
                ? signature.updatedAt
                : signature.createdAt}
            </Typography>
          ) : (
            <Typography display="inline">
              {NON_BREAKING_SPACE}
            </Typography>
          )}
        </div>
      </span>
    );
  }

  return (
    <Paper elevation={2} className="signatures">
      <div className="signatures__name">
        <Typography variant="body2">
          {title}
        </Typography>
        {signature && signature.ident && (
          <Typography>
            {signature.firstName}
            {' '}
            {signature.lastName}
          </Typography>
        )}
        {(!signature || !signature.ident) && canEdit && (
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
        {signature && signature.ident ? (
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
      {signature && signature.ident && canEdit && (
        <div className="signatures__button">
          <IconButton
            size="small"
            onClick={handleRevoke}
          >
            <RemoveCircleIcon />
          </IconButton>
        </div>
      )}
    </Paper>
  );
};

SignatureCard.defaultProps = {
  isPrint: false,
};

export default SignatureCard;
