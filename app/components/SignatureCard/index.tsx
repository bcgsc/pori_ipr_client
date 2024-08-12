import React, {
  useState, useEffect, useMemo,
  useCallback,
} from 'react';
import {
  Paper,
  Typography,
  IconButton,
  Button,
} from '@mui/material';
import api from '@/services/api';
import GestureIcon from '@mui/icons-material/Gesture';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import snackbar from '@/services/SnackbarUtils';
import { UserType } from '@/common';
import useReport from '@/hooks/useReport';
import useResource from '@/hooks/useResource';
import useSecurity from '@/hooks/useSecurity';
import { formatDate } from '@/utils/date';
import { SignatureType, SignatureUserType } from './types';

import './index.scss';

export type { SignatureUserType } from './types';

const NON_BREAKING_SPACE = '\u00A0';

export type SignatureCardProps = {
  title: string;
  signatures: SignatureType;
  onClick: (isSigned: boolean, updatedSignature: SignatureType) => void;
  type: SignatureUserType;
  isPrint?: boolean;
};

const SignatureCard = ({
  title,
  signatures,
  onClick,
  type,
  isPrint = false,
}: SignatureCardProps): JSX.Element => {
  const { reportAssignmentAccess: canAddSignatures } = useResource();
  const { canEdit, report, setReport } = useReport();
  const { userDetails } = useSecurity();

  const [userSignature, setUserSignature] = useState<UserType>();
  const [role, setRole] = useState('');

  useEffect(() => {
    if (signatures && type) {
      if (type === 'author') {
        setUserSignature(signatures.authorSignature);
        setRole('author');
      } else if (type === 'reviewer') {
        setUserSignature(signatures.reviewerSignature);
        setRole('reviewer');
      } else if (type === 'creator') {
        setUserSignature(signatures.creatorSignature);
        setRole('bioinformatician');
      }
    }
  }, [signatures, type, setRole]);

  const handleSign = useCallback(async () => {
    let newReport = null;

    // Assign user
    try {
      newReport = await api.post(
        `/reports/${report.ident}/user`,
        // Hardcode analyst role here because report does not accept 'author'
        { user: userDetails.ident, role: 'analyst' },
        {},
      ).request();
    } catch (e) {
      // If user already assigned, silent fail this add
      if (e.content?.status !== 409) {
        snackbar.error('Error assigning user to report: ', e.message);
      }
    }

    // Do signature
    try {
      const newSignature = await api.put(
        `/reports/${report.ident}/signatures/sign/${role}`,
        {},
      ).request();

      if (newReport) {
        setReport(newReport);
      }
      onClick(true, newSignature);
      snackbar.success('User assigned to report');
    } catch (err) {
      snackbar.error(`Error adding user: ${err}`);
    }
  }, [onClick, report.ident, role, setReport, userDetails.ident]);

  const handleRevoke = useCallback(async () => {
    try {
      const newSignature = await api.put(
        `/reports/${report.ident}/signatures/revoke/${role}`,
        {},
      ).request();
      onClick(false, newSignature);
      snackbar.success('User removed from report');
    } catch (err) {
      snackbar.error(`Error removing user: ${err}`);
    }
  }, [onClick, report.ident, role]);

  const renderDate = useMemo(() => {
    if (signatures?.ident) {
      let formattedDate = '';
      if (type === 'author' && signatures.authorSignedAt) {
        formattedDate = formatDate(signatures.authorSignedAt, true);
      }
      if (type === 'reviewer' && signatures.reviewerSignedAt) {
        formattedDate = formatDate(signatures.reviewerSignedAt, true);
      }
      if (type === 'creator' && signatures.creatorSignedAt) {
        formattedDate = formatDate(signatures.creatorSignedAt, true);
      }
      if (isPrint) {
        return (
          <Typography variant="body2" display="inline">
            {formattedDate}
          </Typography>
        );
      }
      return (
        <Typography>
          {formattedDate}
        </Typography>
      );
    }
    return null;
  }, [signatures, type, isPrint]);

  if (isPrint && !userSignature) {
    return null
  }

  if (isPrint && userSignature) {
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
          {renderDate}
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
        {!userSignature?.ident && (canEdit || canAddSignatures) && (
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
        )}
      </div>
      <div className="signatures__date">
        <Typography variant="body2">
          Date
        </Typography>
        {renderDate ?? (
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

export type { SignatureType };
