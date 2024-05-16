import React, {
  useState, useEffect, useCallback,
} from 'react';
import { CircularProgress } from '@mui/material';
import { RecordDefaults } from '@/common';
import IPRWYSIWYGEditor from '@/components/IPRWYSIWYGEditor';
import sanitizeHtml from 'sanitize-html';
import api from '@/services/api';
import snackbar from '@/services/SnackbarUtils';
import DataTable from '@/components/DataTable';
import columnDefs from './columnDefs';

function Appendices(): JSX.Element {
  const [appendices, setAppendices] = useState<RecordDefaults[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editingData, setEditingData] = useState(null);

  // Grab template appendices
  useEffect(() => {
    let cancelled = false;
    const getAppendices = async () => {
      const appendixResp = await api.get('/appendix').request();
      if (!cancelled) {
        setAppendices(appendixResp);
        setIsLoading(false);
      }
    };
    getAppendices();
    return function cleanup() { cancelled = true; };
  }, []);

  const handleOnEdit = useCallback((rowData) => {
    setEditingData(rowData);
    setIsEditing(true);
  }, []);

  const handleEditClose = useCallback(async (nextData) => {
    let cancelled = false;
    const isNew = !editingData?.text;
    try {
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
                target: '_blank',
                rel: 'noopener noreferrer',
              },
            }),
          },
        });
        const res = await (isNew ? api.post : api.put)(`/appendix?templateId=${editingData.template.ident}&projectId=${editingData.project.ident}`, { text: sanitizedText }).request();
        if (!cancelled) {
          setAppendices((currAppendices) => {
            const index = currAppendices.findIndex((app) => app.ident === editingData.ident);
            const nextAppendices = [...currAppendices];
            nextAppendices[index] = res;
            return nextAppendices;
          });
          snackbar.success(isNew ? 'Appendix successfully created.' : 'Appendix successfully updated.');
          setIsEditing(false);
        }
      }
    } catch (e) {
      snackbar.error(`Error editing appendix: ${e.message ?? e}`);
    } finally {
      setIsEditing(false);
    }

    return function cleanup() { cancelled = true; };
  }, [editingData]);

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
          <IPRWYSIWYGEditor
            title="Edit Appendix"
            isOpen={isEditing}
            text={editingData?.text}
            onClose={handleEditClose}
          />
        </>
      )}
      {isLoading && <CircularProgress />}
    </>
  );
}
export default Appendices;
