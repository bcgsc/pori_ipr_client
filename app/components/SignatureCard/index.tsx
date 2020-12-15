import React, { useContext, useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  IconButton,
  Button,
} from '@material-ui/core';
import GestureIcon from '@material-ui/icons/Gesture';
import RemoveCircleIcon from '@material-ui/icons/RemoveCircle';

import EditContext from '../EditContext';
import { formatDate } from '../../utils/date';

import './index.scss';

const NON_BREAKING_SPACE = '\u00A0';

type Props = {
  title: string,
  signatures: null | Record<string, unknown | Record<string, unknown>>,
  onClick: (arg0: boolean, arg1: string) => void,
  role: 'author' | 'reviewer',
  isPrint: boolean,
};

const SignatureCard: React.FC<Props> = ({
  title,
  signatures,
  onClick,
  role,
  isPrint,
}) => {
  const { canEdit } = useContext(EditContext);
  const [userSignature, setUserSignature] = useState<Record<string, unknown>>({});

  useEffect(() => {
    if (signatures && role) {
      if (role === 'author') {
        setUserSignature(signatures.authorSignature);
      } else {
        setUserSignature(signatures.reviewerSignature);
      }
    }
  }, [signatures, role]);

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
          {userSignature?.ident ? (
            <Typography variant="body2" display="inline">
              {userSignature.firstName}
              {' '}
              {userSignature.lastName}
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
          {signatures?.ident ? (
            <Typography variant="body2" display="inline">
              {role === 'author' ? formatDate(signatures.authorSignedAt, true) : formatDate(signatures.reviewerSignedAt, true)}
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
        {userSignature?.ident && (
          <Typography>
            {userSignature.firstName}
            {' '}
            {userSignature.lastName}
          </Typography>
        )}
        {!userSignature?.ident && canEdit && (
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
        {signatures?.ident ? (
          <Typography>
            {role === 'author' ? formatDate(signatures.authorSignedAt, true) : formatDate(signatures.reviewerSignedAt, true)}
          </Typography>
        ) : (
          <Typography>
            {NON_BREAKING_SPACE}
          </Typography>
        )}
      </div>
      {userSignature?.ident && canEdit && (
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
