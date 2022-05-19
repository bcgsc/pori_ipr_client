import React, {
  useState, useEffect, useCallback,
} from 'react';
import { CircularProgress } from '@mui/material';
import { RecordDefaults, AppendixType } from '@/common';
import AppendixEditor from '@/components/AppendixEditor';
import sanitizeHtml from 'sanitize-html';
import api from '@/services/api';
import snackbar from '@/services/SnackbarUtils';
import DataTable from '@/components/DataTable';
import columnDefs from './columnDefs';

type TemplateWithAppendix = RecordDefaults & { appendix?: AppendixType };

function Appendices(): JSX.Element {
  const [templates, setTemplates] = useState<RecordDefaults[]>([]);
  const [appendices, setAppendices] = useState<TemplateWithAppendix[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editingData, setEditingData] = useState(null);

  // Grab templates
  useEffect(() => {
    let cancelled = false;
    const getTemplates = async () => {
      const templatesResp = await api.get('/templates').request();
      if (!cancelled) {
        setTemplates(templatesResp);
      }
    };
    getTemplates();
    return function cleanup() { cancelled = true; };
  }, []);

  // Grab template appendices
  useEffect(() => {
    let cancelled = false;
    const templateIdToObj = {};
    const getAppendices = async () => {
      const promises = await Promise.all(templates
        .map((t) => {
          templateIdToObj[t.ident] = t;
          return t.ident;
        })
        .map(async (templateId) => api.get(`/templates/${templateId}/appendix`, { raw: true }).request()));
      const responses = await Promise.all(promises.map((p) => p.json()));

      if (!cancelled) {
        responses.forEach((resp, i) => {
          if (!resp.error) {
            templateIdToObj[templates[i].ident].appendix = resp;
          }
        });
        const nextAppendices = Object.values(templateIdToObj) as TemplateWithAppendix[];
        setAppendices(nextAppendices);
        setIsLoading(false);
      }
    };
    getAppendices();
    return function cleanup() { cancelled = true; };
  }, [templates]);

  const handleOnEdit = useCallback((rowData) => {
    setEditingData(rowData);
    setIsEditing(true);
  }, []);

  const handleEditClose = useCallback(async (nextData) => {
    let cancelled = false;
    const isNew = !editingData?.appendix;
    if (nextData) {
      const sanitizedText = sanitizeHtml(nextData, {
        allowedAttributes: {
          a: ['href', 'target', 'rel'],
        },
        transformTags: {
          a: (_tagName, attribs) => ({
            tagName: 'a',
            attribs: {
              href: attribs.href,
              target: '_blankk',
              rel: 'noopener noreferrer',
            },
          }),
        },
      });
      const res = await (isNew ? api.post : api.put)(`/templates/${editingData.ident}/appendix`, { text: sanitizedText }).request();
      if (!cancelled) {
        setAppendices((currAppendices) => {
          const index = currAppendices.findIndex((app) => app.ident === editingData.ident);
          const nextAppendices = [...currAppendices];
          nextAppendices[index] = {
            ...nextAppendices[index],
            appendix: res,
          };
          return nextAppendices;
        });
        snackbar.success(isNew ? 'Appendix successfully created.' : 'Appendix successfully updated.');
        setIsEditing(false);
      }
    }
    setIsEditing(false);
    return function cleanup() { cancelled = true; };
  }, [editingData?.appendix, editingData?.ident]);

  return (
    <>
      {!isLoading && (
        <>
          <DataTable
            columnDefs={columnDefs}
            rowData={appendices}
            titleText="Appendices"
            canEdit
            onEdit={handleOnEdit}
          />
          <AppendixEditor
            isOpen={isEditing}
            text={editingData?.appendix?.text}
            onClose={handleEditClose}
          />
        </>
      )}
      {isLoading && <CircularProgress />}
    </>
  );
}
export default Appendices;
