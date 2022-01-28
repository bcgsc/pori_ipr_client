import React, { useState, useCallback, useEffect } from 'react';
import { CircularProgress, Fab } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import api from '@/services/api';
import AppendixEditor from '../AppendixEditor';
import snackbar from '@/services/SnackbarUtils';
import sanitizeHtml from 'sanitize-html';
import './index.scss';

type ReportOverviewProps = {
  canEdit: boolean;
  isNew: boolean;
  text: string;
  isPrint: boolean;
  templateId: string;
};

const ReportOverview = ({
  isPrint,
  isNew,
  text,
  canEdit,
  templateId,
}: ReportOverviewProps): JSX.Element => {
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [appendixText, setAppendixText] = useState('');

  useEffect(() => {
    setAppendixText(text);
  }, [text]);

  const handleEditClose = useCallback(async (updatedText?: string) => {
    if (updatedText) {
      setIsLoading(true);
      const sanitizedText = sanitizeHtml(updatedText);
      try {
        if (isNew) {
          const res = await api.post(`/templates/${templateId}/appendix`, { text: sanitizedText }).request();
          setAppendixText(res?.text);
          snackbar.success('Appendix successfully created.');
        } else {
          const res = await api.put(`/templates/${templateId}/appendix`, { text: sanitizedText }).request();
          setAppendixText(res?.text);
          snackbar.success('Appendix successfully updated.');
        }
      } catch (e) {
        snackbar.error(`Network error: ${e}`);
      } finally {
        setIsLoading(false);
        setIsEditing(false);
      }
    } else {
      setIsEditing(false);
    }
  }, [isNew, templateId]);

  return (
    <div className="overview">
      {isLoading ? <CircularProgress color="inherit" size={20} />
        : <>
          {(canEdit && !isEditing && !isPrint) &&
            <Fab
              className="overview__fab"
              onClick={() => setIsEditing(true)}
              size="small"
              color="secondary"
            >
              <EditIcon />
            </Fab>
          }
          {
            canEdit &&
            <AppendixEditor
              isOpen={isEditing}
              onClose={handleEditClose}
              text={appendixText}
            />
          }
          {<div dangerouslySetInnerHTML={{ __html: appendixText }} />}
        </>
      }
    </div>
  );
};

export default ReportOverview;
export { ReportOverviewProps };
