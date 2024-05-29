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
import AddEditAppendix from './components/AddEditAppendix';

function Appendices(): JSX.Element {
  const [appendices, setAppendices] = useState<RecordDefaults[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
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
  }, [appendices]);

  const handleOnEdit = useCallback((rowData) => {
    setEditingData(rowData);
    setIsEditing(true);
  }, []);

  const handleOnAdd = useCallback(() => {
    setIsAdding(true);
  }, []);

  const handleOnDelete = useCallback(async (rowData) => {
    try {
      if (rowData.project) {
        await api.del(`/appendix?templateId=${rowData.template.ident}&projectId=${rowData.project.ident}`, {}, {}).request();
        setAppendices((prevVal) => prevVal.filter((appendix) => appendix.ident !== rowData.ident));
      } else {
        await api.del(`/appendix?templateId=${rowData.template.ident}`, {}, {}).request();
      }
      snackbar.success('Appendix deleted');
    } catch (err) {
      snackbar.error(`Error deleting appendix: ${err}`);
    }
  }, []);

  const handleAddClose = useCallback((newData) => {
    if (newData) {
      setAppendices((prevVal) => [...prevVal, newData]);
    }
    setIsAdding(false);
  }, []);

  const handleEditClose = useCallback(async (nextData) => {
    let cancelled = false;
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
        const res = await api.put(`/appendix?templateId=${editingData.template.ident}&projectId=${editingData.project.ident}`, { text: sanitizedText }).request();
        if (!cancelled) {
          setAppendices((currAppendices) => {
            const index = currAppendices.findIndex((app) => app.ident === editingData.ident);
            const nextAppendices = [...currAppendices];
            nextAppendices[index] = res;
            return nextAppendices;
          });
          snackbar.success('Appendix successfully updated.');
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
            canAdd
            onAdd={handleOnAdd}
            addText="Create Custom Template Appendix"
            canEdit
            onEdit={handleOnEdit}
            canDelete
            onDelete={handleOnDelete}
          />
          <IPRWYSIWYGEditor
            title="Edit Appendix Text"
            isOpen={isEditing}
            text={editingData?.text}
            onClose={handleEditClose}
          />
          <AddEditAppendix
            isOpen={isAdding}
            onClose={handleAddClose}
          />
        </>
      )}
      {isLoading && <CircularProgress />}
    </>
  );
}
export default Appendices;
