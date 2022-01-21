import React, { useState, useCallback, useEffect, useContext } from 'react';
import { Fab } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import api from '@/services/api';
import AppendixEditor from '../AppendixEditor';
import snackbar from '@/services/SnackbarUtils';
import ConfirmContext from '@/context/ConfirmContext';
import sanitizeHtml from 'sanitize-html';
import './index.scss';

type GenomicReportOverviewProps = {
  canEdit: boolean;
  isPrint: boolean;
  templateId: string;
}

const GenomicReportOverview = ({
  isPrint,
  canEdit,
  templateId,
}: GenomicReportOverviewProps): JSX.Element => {
  const { isSigned } = useContext(ConfirmContext);
  const [isEditing, setIsEditing] = useState(false);
  const [isNewTemplate, setIsNewTemplate] = useState(false);
  const [appendixText, setAppendixText] = useState('');

  useEffect(() => {
    const getData = async () => {
      try {
        const { text } = await api.get(`/templates/${templateId}/appendix`).request();
        setAppendixText(text);
      } catch (e) {
        if (e.name === 'APIConnectionFailureError') {
          setIsNewTemplate(true);
        } else {
          snackbar.error(e);
        }
      }
    }
    getData();
  }, [templateId]);

  const handleEditClose = useCallback(async (updatedText?: string) => {
    if (updatedText) {
      const sanitizedText = sanitizeHtml(updatedText);
      try {
        let req;
        if (isNewTemplate) {
          req = api.post(`/templates/${templateId}/appendix`, {
            text: sanitizedText
          });
        } else {
          req = api.put(`/templates/${templateId}/appendix`, {
            text: sanitizedText
          });
        }
        const { text: nextAppendixText } = await req.request(isSigned);
        setAppendixText(nextAppendixText);
        snackbar.success(`Appendix successfully ${isNewTemplate ? 'created' : 'updated'}`);
        setIsNewTemplate(false);
      } catch (error) {
        snackbar.error(`Network error: ${error}`);
      } finally {
        setIsEditing(false);
      }
    } else {
      setIsEditing(false);
    }
  }, [isNewTemplate]);

  return (
    <div className="overview">
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
          appendixText={appendixText}
        />
      }
      {<div dangerouslySetInnerHTML={{ __html: appendixText }} />}
    </div>
  )
};

export default GenomicReportOverview;
