import React, {
  useEffect, useState, useContext, useCallback, useMemo, useRef,
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
import useSignatures from '@/hooks/useSignatures';
import { useSignatureTypes, DEFAULT_SIGNATURE_TYPES } from '@/hooks/useSignatureTypes';
import DemoDescription from '@/components/DemoDescription';
import ReportContext, { ReportType } from '@/context/ReportContext';
import SignatureCard, { SignatureType, SignatureUserType } from '@/components/SignatureCard';
import ConfirmContext from '@/context/ConfirmContext';
import withLoading, { WithLoadingInjectedProps } from '@/hoc/WithLoading';
import capitalize from 'lodash/capitalize';
import useConfirmDialog from '@/hooks/useConfirmDialog';
import IPRWYSIWYGEditor from '@/components/IPRWYSIWYGEditor';

import './index.scss';
import { useQuery, useQueryClient } from 'react-query';
import { Editor } from '@tiptap/react';

const AUTO_SAVE_INTERVAL = 30 * 1000; // Autosaves per 30s

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

  const editorRef = useRef<{ editor: Editor, isDirty: boolean | null }>();
  const [comments, setComments] = useState('');
  const [signatures, setSignatures] = useState<SignatureType>();
  const [signatureTypes, setSignatureTypes] = useState<SignatureUserType[]>(DEFAULT_SIGNATURE_TYPES);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  const commentsQuery = useComments(report);
  const signaturesQuery = useSignatures(report);
  const signatureTypesQuery = useSignatureTypes(report);
  const queryClient = useQueryClient();

  const isApiLoading = commentsQuery.isLoading || signaturesQuery.isLoading || signatureTypesQuery.isLoading;
  const isError = commentsQuery.isError || signaturesQuery.isError || signatureTypesQuery.isError;

  useEffect(() => {
    if (isError) {
      snackbar.error(`Network error: ${
        commentsQuery.error || signaturesQuery.error || signatureTypesQuery.error
      }`);
    }
  }, [commentsQuery.error, isError, signatureTypesQuery.error, signaturesQuery.error]);

  useEffect(() => {
    if (!isApiLoading) {
      setComments(commentsQuery.data);
      setSignatures(signaturesQuery.data);
      setSignatureTypes(signatureTypesQuery.data);
      setIsComponentLoading(false);
      if (loadedDispatch) loadedDispatch({ type: 'analyst-comments' });
    }
  }, [setIsComponentLoading, isApiLoading, isError, commentsQuery.data, signaturesQuery.data, signatureTypesQuery.data, loadedDispatch]);

  // Try to load previously unsaved analyst comments
  useEffect(() => {
    if (isEditorOpen && !isApiLoading) {
      const savedComments = localStorage.getItem(`${report.ident}-analyst_comments`);
      if (savedComments) {
        snackbar.info('Loaded previously unsaved analyst comments, please remember to save.');
        localStorage.removeItem(`${report.ident}-analyst_comments`);
        editorRef.current.editor.commands.setContent(savedComments);
      }
    }
  }, [isApiLoading, isEditorOpen, report.ident]);

  // Intervally saves in-edit analyst comments
  useEffect(() => {
    const interval = setInterval(() => {
      const editor = editorRef.current?.editor;
      const isDirty = editorRef.current?.isDirty;
      if (!editor) return;

      // When user is actively editing
      if (isEditorOpen && isDirty) {
        localStorage.setItem(`${report.ident}-analyst_comments`, editorRef.current.editor.getHTML());
      }
    }, AUTO_SAVE_INTERVAL);

    return () => clearInterval(interval);
  }, [isEditorOpen, report.ident]);

  const handleSign = useCallback(async (signed: boolean) => {
    setIsSigned(signed);
    await queryClient.refetchQueries({ queryKey: ['report-signatures', report?.ident] });
  }, [report?.ident, setIsSigned, queryClient]);

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
            await queryClient.refetchQueries({ queryKey: ['report-comments', report?.ident] });
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
          await queryClient.refetchQueries({ queryKey: ['report-comments', report?.ident] });
          snackbar.success('Comment updated');
          if (shouldCloseEditor) {
            setIsEditorOpen(false);
          }
        }
      } catch (e) {
        snackbar.error(`Error saving edit: ${e.message ?? e}`);
      }
    },
    [report, isSigned, showConfirmDialog, queryClient],
  );

  const handleEditorSave = useCallback(
    (editedComments?: string) => {
      // Clear sessionStoarge because the user already saved
      localStorage.removeItem(`${report.ident}-analyst_comments`);
      return handleEditorAction(editedComments, false);
    },
    [handleEditorAction, report.ident],
  );

  const handleEditorClose = useCallback(
    (editedComments?: string) => {
      // Clear sessionStoarge because the user decided to not save
      localStorage.removeItem(`${report.ident}-analyst_comments`);
      return handleEditorAction(editedComments, true);
    },
    [handleEditorAction, report.ident],
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
        disabled={isApiLoading}
      />
    );
  }), [signatureTypes, isPrint, handleSign, signatures, isApiLoading]);

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
                style={{ right: 295, position: 'fixed' }}
              >
                <EditIcon />
              </Fab>
              <IPRWYSIWYGEditor
                ref={editorRef}
                alertLeave
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
              // eslint-disable-next-line react/no-danger
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
