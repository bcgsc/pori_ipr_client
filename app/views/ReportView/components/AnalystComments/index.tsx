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
import { DEFAULT_SIGNATURE_TYPES, useSignatureTypes } from '@/hooks/useSignatureTypes';
import DemoDescription from '@/components/DemoDescription';
import SignatureCard, { SignatureType } from '@/components/SignatureCard';
import ConfirmContext from '@/context/ConfirmContext';
import withLoading, { WithLoadingInjectedProps } from '@/hoc/WithLoading';
import capitalize from 'lodash/capitalize';
import useConfirmDialog from '@/hooks/useConfirmDialog';
import IPRWYSIWYGEditor from '@/components/IPRWYSIWYGEditor';

import './index.scss';
import { Editor } from '@tiptap/react';
import { useReportSignatures, useReportSummaryAnalystComments } from '@/queries/get';
import { AnalystCommentType } from '@/common';

const AUTO_SAVE_INTERVAL = 30 * 1000; // Autosaves per 30s

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
  const { setIsSigned } = useContext(ConfirmContext);
  const { report, canEdit } = useReport();
  const { showConfirmDialog } = useConfirmDialog();

  const editorRef = useRef<{ editor: Editor, isDirty: boolean | null }>();
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  const {
    data: comments,
    refetch: refetchComments,
    isLoading: isCommentsLoading,
    isError: isCommentsError,
  } = useReportSummaryAnalystComments<AnalystCommentType>(report.ident, {
    select: (data) => {
      if (data.comments) {
        data.comments = sanitizeHtml(data.comments, {
          allowedSchemes: [],
          allowedAttributes: { '*': ['style'] },
        });
      }
      return data;
    },
  });

  const {
    data: signatures,
    refetch: refetchSignatures,
    isLoading: isSignaturesLoading,
    isError: isSignaturesError,
  } = useReportSignatures<SignatureType>(report.ident);

  const {
    data: signatureTypes = DEFAULT_SIGNATURE_TYPES,
    isLoading: isSignatureTypesLoading,
    isError: isSignatureTypesError,
  } = useSignatureTypes(report);

  const isApiLoading = isCommentsLoading || isSignaturesLoading || isSignatureTypesLoading;
  const isError = isCommentsError || isSignaturesError || isSignatureTypesError;

  useEffect(() => {
    if (isError) {
      snackbar.error(`Network error: ${
        isCommentsError || isSignaturesError || isSignatureTypesError
      }`);
    }
  }, [isCommentsError, isError, isSignatureTypesError, isSignaturesError]);

  useEffect(() => {
    if (!isApiLoading) {
      setIsComponentLoading(false);
      if (loadedDispatch) loadedDispatch({ type: 'analyst-comments' });
    }
  }, [setIsComponentLoading, isApiLoading, isError, loadedDispatch]);

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
    refetchSignatures();
  }, [refetchSignatures, setIsSigned]);

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
            await refetchComments();
            snackbar.success('Comment updated');
          }
        } else {
          await commentCall.request();
          await refetchComments();
          snackbar.success('Comment updated');
          if (shouldCloseEditor) {
            setIsEditorOpen(false);
          }
        }
      } catch (e) {
        snackbar.error(`Error saving edit: ${e.message ?? e}`);
      }
    },
    [report.ident, isSigned, showConfirmDialog, refetchComments],
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
  }), [signatureTypes, isPrint, handleSign, isApiLoading, signatures]);

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
                text={comments.comments}
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
              dangerouslySetInnerHTML={{ __html: comments.comments }}
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
