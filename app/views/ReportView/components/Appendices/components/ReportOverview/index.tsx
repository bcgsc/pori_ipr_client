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
  // Appendix Specific to template ID + project ID
  templateSpecificText: string;
  reportId: string;
  // Appendix Specific to current Report
  reportSpecificText: string;
  isPrint: boolean;
};

const ReportOverview = ({
  isPrint,
  templateSpecificText,
  reportId,
  reportSpecificText,
  canEditReportAppendix,
}: ReportOverviewProps): JSX.Element => {
  const [isLoading, setIsLoading] = useState(false);
  const [isEditingReport, setIsEditingReport] = useState(false);
  const [templateAppendixText, setTemplateAppendixText] = useState('');
  const [reportAppendixText, setReportAppendixText] = useState('');

  useEffect(() => {
    setTemplateAppendixText(templateSpecificText);
  }, [templateSpecificText]);

  useEffect(() => {
    setReportAppendixText(reportSpecificText);
  }, [reportSpecificText]);

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
      <div dangerouslySetInnerHTML={{ __html: templateAppendixText }} />
    );
  }, [
    isLoading,
    templateAppendixText,
  ]);

  const reportAppendixSection = useMemo(() => {
    if (isLoading) {
      return <CircularProgress color="inherit" size={20} />;
    }
    return (
      <>
        {(canEditReportAppendix && !isPrint)
          && (
            <Fab
              className="overview__fab"
              variant="extended"
              onClick={() => setIsEditingReport(true)}
              color="secondary"
            >
              <EditIcon sx={{ mr: 1 }} />
              Add text to this report&apos;s appendix
            </Fab>
          )}
        {canEditReportAppendix && (
          <IPRWYSIWYGEditor
            title="Edit Report Appendix"
            isOpen={isEditingReport}
            onClose={handleEditReportClose}
            text={reportAppendixText}
          />
        )}
        {reportAppendixText && <div dangerouslySetInnerHTML={{ __html: reportAppendixText }} />}
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

  const showDivider = (!isPrint && canEditReportAppendix)
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
export { ReportOverview, ReportOverviewProps };
