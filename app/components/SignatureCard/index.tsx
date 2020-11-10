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
  type: 'author' | 'reviewer',
  isPrint: boolean,
};

const SignatureCard = ({
  title,
  signatures,
  onClick,
  type,
  isPrint,
}: Props): JSX.Element => {
  const { canEdit } = useContext(EditContext);
  const [userSignature, setUserSignature] = useState<Record<string, unknown>>({});

  useEffect(() => {
    if (signatures && type) {
      if (type === 'author') {
        setUserSignature(signatures.authorSignature);
      } else {
        setUserSignature(signatures.reviewerSignature);
      }
    }
  }, [signatures, type]);

  const handleSign = () => {
    onClick(true, type);
  };

  const handleRevoke = () => {
    onClick(false, type);
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
              {type === 'author' ? formatDate(signatures.authorSignedAt, true) : formatDate(signatures.reviewerSignedAt, true)}
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
            {type === 'author' ? formatDate(signatures.authorSignedAt, true) : formatDate(signatures.reviewerSignedAt, true)}
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

export default SignatureCard;
