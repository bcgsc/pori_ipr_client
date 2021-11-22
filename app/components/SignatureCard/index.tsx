import React, {
  useState, useEffect, useMemo,
} from 'react';
import {
  Paper,
  Typography,
  IconButton,
  Button,
} from '@mui/material';
import GestureIcon from '@mui/icons-material/Gesture';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';

import { UserType } from '@/common';
import useEdit from '@/hooks/useEdit';
import { formatDate } from '@/utils/date';
import SignatureType from './types';

import './index.scss';

const NON_BREAKING_SPACE = '\u00A0';

export type SignatureCardProps = {
  title: string;
  signatures: SignatureType;
  onClick: (isSigned: boolean, type: string) => void;
  type: 'author' | 'reviewer';
  isPrint?: boolean;
};

const SignatureCard = ({
  title,
  signatures,
  onClick,
  type,
  isPrint = false,
}: SignatureCardProps): JSX.Element => {
  const { canEdit } = useEdit();
  const [userSignature, setUserSignature] = useState<UserType>();

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

  const renderDate = useMemo(() => {
    if (type === 'author' && signatures?.authorSignedAt) {
      return formatDate(signatures?.authorSignedAt, true);
    }
    if (type === 'reviewer' && signatures?.reviewerSignedAt) {
      return formatDate(signatures?.reviewerSignedAt, true);
    }
    return '';
  }, [signatures, type]);

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
          {signatures?.ident
            && (type === 'author' ? signatures?.authorSignature?.ident : signatures?.reviewerSignature?.ident)
            && (
              <Typography variant="body2" display="inline">
                {renderDate}
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
              size="small"
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
        {signatures?.ident
          && (type === 'author' ? signatures?.authorSignature?.ident : signatures?.reviewerSignature?.ident)
          ? (
            <Typography>
              {renderDate}
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

export { SignatureType };
