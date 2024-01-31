import React, {
  useEffect, useState, useContext, useCallback, useMemo,
} from 'react';
import {
  Typography,
  Fab,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import sanitizeHtml from 'sanitize-html';

import api from '@/services/api';
import snackbar from '@/services/SnackbarUtils';
import { useUser } from '@/context/UserContext';
import DemoDescription from '@/components/DemoDescription';
import ReportContext from '@/context/ReportContext';
import SignatureCard, { SignatureType, SignatureUserType } from '@/components/SignatureCard';
import ConfirmContext from '@/context/ConfirmContext';
import withLoading, { WithLoadingInjectedProps } from '@/hoc/WithLoading';
import capitalize from 'lodash/capitalize';
import useConfirmDialog from '@/hooks/useConfirmDialog';
import IPRWYSIWYGEditor from '@/components/IPRWYSIWYGEditor';

import './index.scss';

type AnalystCommentsProps = {
  isPrint?: boolean;
  isSigned?: boolean;
  loadedDispatch?: (type: Record<'type', string>) => void;
} & WithLoadingInjectedProps;

const AnalystComments = ({
  isPrint = false,
  isLoading,
  isSigned,
  setIsLoading,
  loadedDispatch,
}: AnalystCommentsProps): JSX.Element => {
  const { report } = useContext(ReportContext);
  const { setIsSigned } = useContext(ConfirmContext);
  const { canEdit } = useUser();
  const { showConfirmDialog } = useConfirmDialog();

  const [comments, setComments] = useState('');
  const [signatures, setSignatures] = useState<SignatureType>();
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  useEffect(() => {
    if (report) {
      const getData = async () => {
        try {
          const [commentsResp, signaturesResp] = await Promise.all([
            api.get(`/reports/${report.ident}/summary/analyst-comments`).request(),
            api.get(`/reports/${report.ident}/signatures`).request(),
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
          if (loadedDispatch) {
            loadedDispatch({ type: 'analyst-comments' });
          }
        }
      };
      getData();
    }
  }, [report, setIsLoading, loadedDispatch]);

  const handleSign = useCallback(async (signed: boolean, role: SignatureUserType) => {
    let newSignature;

    if (signed) {
      newSignature = await api.put(
        `/reports/${report.ident}/signatures/sign/${role}`,
        {},
      ).request();
    } else {
      newSignature = await api.put(
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
    try {
      if (editedComments) {
        const sanitizedText = sanitizeHtml(editedComments, {
          allowedAttributes: {
            a: ['href', 'target', 'rel'],
          },
          transformTags: {
            a: (_tagName, attribs) => ({
              tagName: 'a',
              attribs: {
                href: attribs.href,
                target: '_blank',
                rel: 'noopener noreferrer',
              },
            }),
          },
        });
        const commentCall = api.put(
          `/reports/${report.ident}/summary/analyst-comments`,
          { comments: sanitizedText },
        );

        if (isSigned) {
          showConfirmDialog(commentCall);
        } else {
          // If signed, the dialog that opens up will refesh the page instead
          const commentsResp = await commentCall.request();
          setComments(sanitizeHtml(commentsResp?.comments, {
            allowedSchemes: [],
            allowedAttributes: {
              '*': ['style'],
            },
          }));
        }
      }
    } catch (e) {
      snackbar.error(`Error saving edit: ${e.message ?? e}`);
    } finally {
      setIsEditorOpen(false);
    }
  }, [report, isSigned, showConfirmDialog]);

  const signatureSection = useMemo(() => {
    if (!comments) return null;
    let order: SignatureUserType[] = ['author', 'reviewer', 'creator'];
    if (isPrint) {
      order = ['creator', 'author', 'reviewer'];
    }
    return order.map((sigType) => {
      let title: string = sigType;
      if (sigType === 'author' && isPrint) {
        title = 'Author Review';
      }
      return (
        <SignatureCard
          key={sigType}
          onClick={handleSign}
          signatures={signatures}
          title={capitalize(title)}
          type={sigType}
          isPrint={isPrint}
        />
      );
    });
  }, [isPrint, handleSign, comments, signatures]);

  return (
    <div className={isPrint ? 'analyst-comments--print' : 'analyst-comments'}>
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
              <IPRWYSIWYGEditor
                isOpen={isEditorOpen}
                text={comments}
                title="Edit Comments"
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
              {signatureSection}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default withLoading(AnalystComments);
