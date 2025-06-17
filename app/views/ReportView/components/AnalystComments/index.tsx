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
import ReportContext, { ReportType } from '@/context/ReportContext';
import SignatureCard, { SignatureType, SignatureUserType } from '@/components/SignatureCard';
import ConfirmContext from '@/context/ConfirmContext';
import withLoading, { WithLoadingInjectedProps } from '@/hoc/WithLoading';
import capitalize from 'lodash/capitalize';
import useConfirmDialog from '@/hooks/useConfirmDialog';
import IPRWYSIWYGEditor from '@/components/IPRWYSIWYGEditor';

import './index.scss';
import { useQuery } from 'react-query';

const useComments = (report?: ReportType) => useQuery({
  queryKey: ['report-comments', report?.ident],
  enabled: Boolean(report),
  queryFn: async () => {
    const resp = await api.get(`/reports/${report!.ident}/summary/analyst-comments`).request();
    return resp?.comments
      ? sanitizeHtml(resp.comments, {
        allowedSchemes: [],
        allowedAttributes: { '*': ['style'] },
      })
      : null;
  },
});

const useSignatures = (report?: ReportType) => useQuery({
  queryKey: ['report-signatures', report?.ident],
  enabled: Boolean(report),
  queryFn: () => api.get(`/reports/${report!.ident}/signatures`).request(),
});

const useSignatureTypes = (report?: ReportType) => useQuery({
  queryKey: ['signature-types', report?.template.ident],
  enabled: Boolean(report?.template?.ident),
  queryFn: async () => {
    const resp = await api.get(`/templates/${report!.template.ident}/signature-types`).request();
    return resp?.length === 0
      ? [
        { signatureType: 'author' },
        { signatureType: 'reviewer' },
        { signatureType: 'creator' },
      ] as SignatureUserType[]
      : resp;
  },
});

type AnalystCommentsProps = {
  isPrint?: boolean;
  isSigned?: boolean;
  loadedDispatch?: (type: Record<'type', string>) => void;
} & WithLoadingInjectedProps;

const AnalystComments = ({
  isPrint = false,
  isLoading: isComponentLoading,
  isSigned,
  setIsLoading: setIsComponentLoading,
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

  const commentsQuery = useComments(report);
  const signaturesQuery = useSignatures(report);
  const signatureTypesQuery = useSignatureTypes(report);

  const isApiLoading = commentsQuery.isLoading || signaturesQuery.isLoading || signatureTypesQuery.isLoading;
  const isError = commentsQuery.isError || signaturesQuery.isError || signatureTypesQuery.isError;

  useEffect(() => {
    if (isError) {
      snackbar.error(`Network error: ${
        commentsQuery.error || signaturesQuery.error || signatureTypesQuery.error
      }`);
    }

    if (!isApiLoading) {
      setComments(commentsQuery.data);
      setSignatures(signaturesQuery.data);
      setSignatureTypes(signatureTypesQuery.data);
      setIsComponentLoading(false);
      if (loadedDispatch) loadedDispatch({ type: 'analyst-comments' });
    }
  }, [setIsComponentLoading, isApiLoading, isError, commentsQuery.data, signaturesQuery.data, signatureTypesQuery.data, loadedDispatch, commentsQuery.error, signaturesQuery.error, signatureTypesQuery.error]);

  const handleSign = useCallback(async (signed: boolean, updatedSignature: SignatureType) => {
    setIsSigned(signed);
    setSignatures(updatedSignature);
  }, [setIsSigned]);

  const handleEditorStart = () => {
    setIsEditorOpen(true);
  };

  const handleEditorAction = useCallback(
    async (editedComments?: string, shouldCloseEditor: boolean = false) => {
      if (editedComments == null) {
        setIsEditorOpen(false);
        return;
      }

      try {
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
          const isResolved = await showConfirmDialog(commentCall, true);
          if (isResolved) {
            snackbar.success('Comment updated');
          }
        } else {
          const commentsResp = await commentCall.request();
          setComments(
            sanitizeHtml(commentsResp?.comments, {
              allowedSchemes: [],
              allowedAttributes: {
                '*': ['style'],
              },
            }),
          );
          snackbar.success('Comment updated');
          if (shouldCloseEditor) {
            setIsEditorOpen(false);
          }
        }
      } catch (e) {
        snackbar.error(`Error saving edit: ${e.message ?? e}`);
      }
    },
    [report, isSigned, showConfirmDialog],
  );

  const handleEditorSave = useCallback(
    (editedComments?: string) => handleEditorAction(editedComments, false),
    [handleEditorAction],
  );

  const handleEditorClose = useCallback(
    (editedComments?: string) => handleEditorAction(editedComments, true),
    [handleEditorAction],
  );

  const signatureSection = useMemo(() => signatureTypes.map((sigType) => {
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
  }), [isPrint, handleSign, signatures, signatureTypes]);

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
      {!(isComponentLoading || isApiLoading) && (
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
                onSave={handleEditorSave}
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
