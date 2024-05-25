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
import { AppendixType } from '@/common';

type AddEditAppendixDialogProps = {
  isOpen: boolean;
  onClose: (newData?: null | AppendixType) => void;
  editData: null | AppendixType;
};

function Appendices(): JSX.Element {
  const [appendices, setAppendices] = useState<RecordDefaults[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [addingData, setAddingData] = useState(null);
  const [editingData, setEditingData] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const [editData, setEditData] = useState<AppendixType>();

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

  const handleOnAdd = useCallback((rowData) => {
    setIsAdding(true);
  }, []);

  const handleOnDelete = useCallback(async (rowData) => {
    console.log('made it into handle on delete');
    console.dir(editingData.template);
    try {
      await api.del(`/appendix?templateId=${editingData.template.ident}&projectId=${editingData.project.ident}`, {}, {}).request();
      //setTemplates((prevVal) => prevVal.filter((template) => template.ident !== rowData.ident));
      snackbar.success('Appendix deleted');
    } catch (err) {
      snackbar.error(`Error deleting appendix: ${err}`);
    }
  }, []);

  const handleAddClose = useCallback(async (nextData) => {
    let cancelled = false;
    console.log('here we are in handleAddClose');
    try {
      if (nextData) {
        console.dir(nextData);
        console.log('hello,');
      }
    } catch (e) {
      snackbar.error(`Error adding appendix: ${e.message ?? e}`);
    } finally {
      setIsAdding(false);
    }

    return function cleanup() { cancelled = true; };
  }, [addingData]);


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
            canAdd
            onAdd={handleOnAdd}
            addText="Create Custom Template Appendix Text"
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
