import React, {
  useEffect, useState, useContext, useCallback,
} from 'react';
import {
  Typography,
  Fab,
} from '@material-ui/core';
import EditIcon from '@material-ui/icons/Edit';
import sanitizeHtml from 'sanitize-html';

import api from '@/services/api';
import snackbar from '@/services/SnackbarUtils';
import useEdit from '@/hooks/useEdit';
import DemoDescription from '@/components/DemoDescription';
import ReportContext from '@/context/ReportContext';
import SignatureCard, { SignatureType } from '@/components/SignatureCard';
import ConfirmContext from '@/context/ConfirmContext';
import withLoading, { WithLoadingInjectedProps } from '@/hoc/WithLoading';
import TextEditor from './components/TextEditor';

import './index.scss';

type AnalystCommentsProps = {
  isPrint?: boolean;
} & WithLoadingInjectedProps;

const AnalystComments = ({
  isPrint = false,
  isLoading,
  setIsLoading,
}: AnalystCommentsProps): JSX.Element => {
  const { report } = useContext(ReportContext);
  const { setIsSigned } = useContext(ConfirmContext);
  const { canEdit } = useEdit();

  const [comments, setComments] = useState('');
  const [signatures, setSignatures] = useState<SignatureType>();
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  useEffect(() => {
    if (report) {
      const getData = async () => {
        try {
          const [commentsResp, signaturesResp] = await Promise.all([
            api.get<{ comments: string }>(`/reports/${report.ident}/summary/analyst-comments`).request(),
            api.get<SignatureType>(`/reports/${report.ident}/signatures`).request(),
          ]);

          if (commentsResp?.comments) {
            setComments(sanitizeHtml(commentsResp?.comments, {
              allowedSchemes: [],
              allowedAttributes: {
                '*': ['style'],
              },
            }));
          }
          setSignatures(signaturesResp);
        } catch (err) {
          snackbar.error(`Network error: ${err}`);
        } finally {
          setIsLoading(false);
        }
      };
      getData();
    }
  }, [report, setIsLoading]);

  const handleSign = useCallback(async (signed: boolean, role: 'author' | 'reviewer') => {
    let newSignature: SignatureType;

    if (signed) {
      newSignature = await api.put<SignatureType>(
        `/reports/${report.ident}/signatures/sign/${role}`,
        {},
      ).request();
    } else {
      newSignature = await api.put<SignatureType>(
        `/reports/${report.ident}/signatures/revoke/${role}`,
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
      const commentsResp = await api.put<{ comments: string }>(
        `/reports/${report.ident}/summary/analyst-comments`,
        { comments: editedComments },
      ).request();
      setComments(sanitizeHtml(commentsResp?.comments, {
        allowedSchemes: [],
        allowedAttributes: {
          '*': ['style'],
        },
      }));
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
      <DemoDescription>
        This section is a manually curated textual summary of the main findings from tumour biopsy sequencing.
      </DemoDescription>
      {!isLoading && (
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
      )}
    </div>
  );
};

export default withLoading(AnalystComments);
