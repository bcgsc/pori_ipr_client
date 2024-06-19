import React, {
  useState, useEffect, useCallback,
} from 'react';
import { CircularProgress } from '@mui/material';
import { VariantTextType } from '@/common';
import IPRWYSIWYGEditor from '@/components/IPRWYSIWYGEditor';
import sanitizeHtml from 'sanitize-html';
import api from '@/services/api';
import snackbar from '@/services/SnackbarUtils';
import DataTable from '@/components/DataTable';
import columnDefs from './columnDefs';
import AddEditVariantText from './components/AddEditVariantText';

function VariantText(): JSX.Element {
  const [variantText, setVariantText] = useState<VariantTextType[]>();
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [editingData, setEditingData] = useState(null);

  // Grab template appendices
  useEffect(() => {
    let cancelled = false;
    const getVariantText = async () => {
      try {
        const variantTextResp = await api.get('/variant-text').request();
        if (variantTextResp) {
          const sanitizedVariantText = variantTextResp.map((variant: VariantTextType) => ({
            ...variant,
            text: sanitizeHtml(variant.text, {
              allowedSchemes: [],
              allowedAttributes: {
                '*': ['style'],
              },
            }),
          }));
          if (!cancelled) {
            setVariantText(sanitizedVariantText);
          }
        }
      } catch (err) {
        snackbar.error(`Network error: ${err}`);
      } finally {
        setIsLoading(false);
      }
    };
    getVariantText();
    return function cleanup() { cancelled = true; };
  }, []);

  const handleOnEdit = useCallback((rowData) => {
    setEditingData(rowData);
    setIsEditing(true);
  }, []);

  const handleOnAdd = useCallback(() => {
    setIsAdding(true);
  }, []);

  const handleOnDelete = useCallback(async (rowData: VariantTextType) => {
    try {
      await api.del(`/variant-text/${rowData.ident}`, {}, {}).request();
      snackbar.success('Variant text deleted');
      setVariantText((prevVal) => prevVal.filter((variant) => variant.ident !== rowData.ident));
    } catch (err) {
      snackbar.error(`Error deleting variant text: ${err}`);
    }
  }, []);

  const handleAddClose = useCallback((newData) => {
    if (newData) {
      setVariantText((prevVal) => [...prevVal, newData]);
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
        const res = await api.put(`/variant-text/${editingData.ident}`, { text: sanitizedText }).request();
        if (!cancelled) {
          setVariantText((currVariantText) => {
            const index = currVariantText.findIndex((app) => app.ident === editingData.ident);
            const nextVariantText = [...currVariantText];
            nextVariantText[index] = res;
            return nextVariantText;
          });
          snackbar.success('Variant Text successfully updated.');
          setIsEditing(false);
        }
      }
    } catch (e) {
      snackbar.error(`Error editing variant text: ${e.message ?? e}`);
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
            rowData={variantText}
            titleText="Variant Text"
            canAdd
            onAdd={handleOnAdd}
            addText="Create Custom Variant Text"
            canEdit
            onEdit={handleOnEdit}
            canDelete
            onDelete={handleOnDelete}
          />
          <IPRWYSIWYGEditor
            title="Edit Variant Text"
            isOpen={isEditing}
            text={editingData?.text}
            onClose={handleEditClose}
          />
          <AddEditVariantText
            isOpen={isAdding}
            onClose={handleAddClose}
          />
        </>
      )}
      {isLoading && <CircularProgress />}
    </>
  );
}
export default VariantText;
