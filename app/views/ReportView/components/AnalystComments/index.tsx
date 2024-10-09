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
import useReport from '@/hooks/useReport';
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
  const { canEdit } = useReport();
  const { showConfirmDialog } = useConfirmDialog();

  const [comments, setComments] = useState('');
  const [signatures, setSignatures] = useState<SignatureType>();
  const [signatureTypes, setSignatureTypes] = useState<SignatureUserType[]>([]);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  useEffect(() => {
    if (report) {
      const getData = async () => {
        try {
          const [commentsResp, signaturesResp, signatureTypesResp] = await Promise.all([
            api.get(`/reports/${report.ident}/summary/analyst-comments`).request(),
            api.get(`/reports/${report.ident}/signatures`).request(),
            api.get(`/templates/${report.template.ident}/signature-types`).request(),
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
          if (signatureTypesResp?.length === 0){
            const defaultSigatureTypes = [
              {signatureType: 'author'},
              {signatureType: 'reviewer'},
              {signatureType: 'creator'},
            ];
            setSignatureTypes(defaultSigatureTypes);
          } else {
            setSignatureTypes(signatureTypesResp);
          }
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

  const handleSign = useCallback(async (signed: boolean, updatedSignature: SignatureType) => {
    setIsSigned(signed);
    setSignatures(updatedSignature);
  }, [setIsSigned]);

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
    return signatureTypes.map((sigType) => {
      let title = sigType.signatureType;
      if (sigType.signatureType === 'author' && isPrint) {
        title = 'Author Review';
      }
      return (
        <SignatureCard
          key={sigType.signatureType}
          onClick={handleSign}
          signatures={signatures}
          title={capitalize(title)}
          type={sigType.signatureType}
          isPrint={isPrint}
        />
      );
    });
  }, [isPrint, handleSign, signatures, signatureTypes]);

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
              className="analyst-comments__user-text inner-html"
              dangerouslySetInnerHTML={{ __html: comments }}
            />
          ) : (
            <Typography align="center" variant="h5">No comments yet</Typography>
          )}
          <div className="analyst-comments__signatures">
            {!isPrint && (
              <Typography variant="h5">Signed By</Typography>
            )}
            {signatureSection}
          </div>
        </>
      )}
    </div>
  );
};

export default withLoading(AnalystComments);
