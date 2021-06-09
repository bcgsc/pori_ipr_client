import React, {
  useEffect, useState, useContext, useCallback,
} from 'react';
import {
  Typography,
  Fab,
  LinearProgress,
} from '@material-ui/core';

import EditIcon from '@material-ui/icons/Edit';

import api, { ApiCallSet } from '@/services/api';
import snackbar from '@/services/SnackbarUtils';
import EditContext from '@/context/EditContext';
import ReportContext from '@/context/ReportContext';
import SignatureCard, { SignatureType } from '@/components/SignatureCard';
import ConfirmContext from '@/context/ConfirmContext';
import TextEditor from './components/TextEditor';

import './index.scss';

type AnalystCommentsProps = {
  isPrint?: boolean;
};

const AnalystComments = ({
  isPrint = false,
}: AnalystCommentsProps): JSX.Element => {
  const { report } = useContext(ReportContext);
  const { canEdit } = useContext(EditContext);
  const { setIsSigned } = useContext(ConfirmContext);

  const [comments, setComments] = useState('');
  const [signatures, setSignatures] = useState<SignatureType>();
  const [isLoading, setIsLoading] = useState(true);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  useEffect(() => {
    if (report) {
      const getData = async () => {
        try {
          const apiCalls = new ApiCallSet([
            api.get(`/reports/${report.ident}/summary/analyst-comments`, {}),
            api.get(`/reports/${report.ident}/signatures`, {}),
          ]);
          const [commentsResp, signaturesResp] = await apiCalls.request();
          setComments(commentsResp?.comments);
          setSignatures(signaturesResp);
        } catch (err) {
          snackbar.error(`Network error: ${err}`);
        } finally {
          setIsLoading(false);
        }
      };
      getData();
    }
  }, [report]);

  const handleSign = useCallback(async (signed: boolean, role: 'author' | 'reviewer') => {
    let newSignature;

    if (signed) {
      newSignature = await api.put(
        `/reports/${report.ident}/signatures/sign/${role}`,
        {},
        {},
      ).request();
    } else {
      newSignature = await api.put(
        `/reports/${report.ident}/signatures/revoke/${role}`,
        {},
        {},
      ).request();
    }

    setIsSigned(signed);
    setSignatures(newSignature);
  }, [report, setIsSigned]);

  const handleEditorStart = () => {
    setIsEditorOpen(true);
  };

  const handleEditorClose = useCallback(async (editedComments?: string) => {
    setIsEditorOpen(false);
    // text returned when nothing is in editor
    if (editedComments === '<p><br></p>') {
      editedComments = '';
    }
    if (editedComments !== undefined) {
      await api.put(
        `/reports/${report.ident}/summary/analyst-comments`,
        { comments: editedComments },
        {},
      ).request();
      setComments(editedComments);
    }
  }, [report]);

  return (
    <div className="analyst-comments">
      <Typography
        variant="h3"
        className="analyst-comments__title"
      >
        Analyst Comments
      </Typography>
      {!isLoading ? (
        <>
          {!isPrint && canEdit && (
            <>
              <Fab
                className="analyst-comments__fab"
                color="secondary"
                onClick={handleEditorStart}
                size="small"
              >
                <EditIcon />
              </Fab>
              <TextEditor
                isOpen={isEditorOpen}
                analystComments={comments}
                onClose={handleEditorClose}
              />
            </>
          )}
          {comments ? (
            <div
              className="analyst-comments__user-text"
              dangerouslySetInnerHTML={{ __html: comments }}
            />
          ) : (
            <Typography align="center" variant="h5">No comments yet</Typography>
          )}
          {comments && (
            <div className="analyst-comments__signatures">
              {!isPrint && (
                <Typography variant="h5">Signed By</Typography>
              )}
              <SignatureCard
                onClick={handleSign}
                signatures={signatures}
                title={isPrint ? 'Author Review' : 'Author'}
                type="author"
                isPrint={isPrint}
              />
              <SignatureCard
                onClick={handleSign}
                signatures={signatures}
                title="Reviewer"
                type="reviewer"
                isPrint={isPrint}
              />
            </div>
          )}
        </>
      ) : (
        <LinearProgress />
      )}
    </div>
  );
};

export default AnalystComments;
