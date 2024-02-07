import React, {
  useState, useCallback, useEffect, useMemo,
} from 'react';
import { CircularProgress, Divider, Fab } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import api from '@/services/api';
import IPRWYSIWYGEditor from '@/components/IPRWYSIWYGEditor';
import snackbar from '@/services/SnackbarUtils';
import sanitizeHtml from 'sanitize-html';
import './index.scss';

type ReportOverviewProps = {
  canEditReportAppendix: boolean;
  canEditTemplateAppendix: boolean;
  isNewTemplate: boolean;
  templateSpecificText: string;
  reportId: string;
  reportSpecificText: string;
  isPrint: boolean;
  templateId: string;
};

const ReportOverview = ({
  isPrint,
  isNewTemplate,
  templateSpecificText,
  reportId,
  reportSpecificText,
  canEditReportAppendix,
  canEditTemplateAppendix,
  templateId,
}: ReportOverviewProps): JSX.Element => {
  const [isLoading, setIsLoading] = useState(false);
  const [isEditingTemplate, setIsEditingTemplate] = useState(false);
  const [isEditingReport, setIsEditingReport] = useState(false);
  const [templateAppendixText, setTemplateAppendixText] = useState('');
  const [reportAppendixText, setReportAppendixText] = useState('');

  useEffect(() => {
    setTemplateAppendixText(templateSpecificText);
  }, [templateSpecificText]);

  useEffect(() => {
    setReportAppendixText(reportSpecificText);
  }, [reportSpecificText]);

  const handleEditTemplateClose = useCallback(async (updatedText?: string) => {
    if (updatedText || updatedText === '') {
      setIsLoading(true);
      const sanitizedText = sanitizeHtml(updatedText, {
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
      try {
        if (isNewTemplate) {
          const res = await api.post(`/templates/${templateId}/appendix`, { text: sanitizedText }).request();
          setTemplateAppendixText(res?.text);
          snackbar.success('Template Appendix successfully created.');
        } else {
          const res = await api.put(`/templates/${templateId}/appendix`, { text: sanitizedText }).request();
          setTemplateAppendixText(res?.text);
          snackbar.success('Template Appendix successfully updated.');
        }
      } catch (e) {
        snackbar.error(`Network error: ${e}`);
      } finally {
        setIsLoading(false);
        setIsEditingTemplate(false);
      }
    } else {
      setIsEditingTemplate(false);
    }
  }, [isNewTemplate, templateId]);

  const handleEditReportClose = useCallback(async (updatedText?: string) => {
    if (updatedText || updatedText === '') {
      setIsLoading(true);
      const sanitizedText = sanitizeHtml(updatedText, {
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
      try {
        const res = await api.put(`/reports/${reportId}`, { appendix: sanitizedText }).request();
        setReportAppendixText(res?.appendix);
        snackbar.success('Report appendix successfully updated.');
      } catch (e) {
        snackbar.error(`Network error: ${e}`);
      } finally {
        setIsLoading(false);
        setIsEditingReport(false);
      }
    } else {
      setIsEditingReport(false);
    }
  }, [reportId]);

  const templateAppendixSection = useMemo(() => {
    if (isLoading) {
      return <CircularProgress color="inherit" size={20} />;
    }
    return (
      <>
        {(canEditTemplateAppendix && !isEditingTemplate && !isPrint)
            && (
              <Fab
                className="overview__fab"
                variant="extended"
                onClick={() => setIsEditingTemplate(true)}
                color="secondary"
              >
                <EditIcon sx={{ mr: 1 }} />
                Template Appendix
              </Fab>
            )}
        {
            canEditTemplateAppendix
            && (
              <IPRWYSIWYGEditor
                title="Edit Appendix"
                isOpen={isEditingTemplate}
                onClose={handleEditTemplateClose}
                text={templateAppendixText}
              />
            )
          }
        <div dangerouslySetInnerHTML={{ __html: templateAppendixText }} />
      </>
    );
  }, [
    canEditTemplateAppendix,
    handleEditTemplateClose,
    isEditingTemplate,
    isLoading,
    isPrint,
    templateAppendixText,
  ]);

  const reportAppendixSection = useMemo(() => {
    if (isLoading) {
      return <CircularProgress color="inherit" size={20} />;
    }
    return (
      <>
        {(canEditReportAppendix && !isEditingReport && !isPrint)
            && (
              <Fab
                className="overview__fab"
                variant="extended"
                onClick={() => setIsEditingReport(true)}
                color="secondary"
              >
                <EditIcon sx={{ mr: 1 }} />
                Report Appendix
              </Fab>
            )}
        {canEditReportAppendix && (
          <IPRWYSIWYGEditor
            title="Edit Appendix"
            isOpen={isEditingReport}
            onClose={handleEditReportClose}
            text={reportAppendixText}
          />
        )}
        <div dangerouslySetInnerHTML={{ __html: reportAppendixText }} />
      </>
    );
  }, [
    canEditReportAppendix,
    handleEditReportClose,
    isEditingReport,
    isLoading,
    isPrint,
    reportAppendixText,
  ]);

  const showDivider = (!isPrint && canEditReportAppendix && canEditTemplateAppendix)
    || (isPrint && reportSpecificText);

  return (
    <div className="overview">
      <section>
        {reportAppendixSection}
      </section>
      {showDivider && (
        <section>
          <Divider sx={{ margin: 1 }} />
        </section>
      )}
      <section>
        {templateAppendixSection}
      </section>
    </div>
  );
};

export default ReportOverview;
export { ReportOverviewProps };
