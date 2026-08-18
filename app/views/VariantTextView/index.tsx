import React, {
  useState, useCallback,
} from 'react';
import { CircularProgress } from '@mui/material';
import { VariantTextType } from '@/common';
import sanitizeHtml from 'sanitize-html';
import api from '@/services/api';
import snackbar from '@/services/SnackbarUtils';
import DataTable from '@/components/DataTable';
import AlertDialog from '@/components/AlertDialog';
import { useQuery, useQueryClient, useMutation } from 'react-query';
import columnDefs from './columnDefs';
import AddEditVariantText from './components/AddEditVariantText';

const fetchVariantText = async () => {
  const data = await api.get('/variant-text').request();
  return data.map((variant: VariantTextType) => ({
    ...variant,
    text: sanitizeHtml(variant.text, {
      allowedSchemes: [],
      allowedAttributes: { '*': ['style'] },
    }),
  }));
};

const deleteVariantText = async (rowData: VariantTextType) => api.del(`/variant-text/${rowData.ident}`, {}, {}).request();

const updateVariantText = async (rowData: VariantTextType) => api.put(`/variant-text/${rowData.ident}`, rowData);

function VariantText(): JSX.Element {
  const [isEditing, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [deletingData, setDeletingData] = useState<VariantTextType | null>(null);
  const [editingData, setEditingData] = useState(null);
  const queryClient = useQueryClient();

  const { data: variantText = [], isLoading } = useQuery<VariantTextType[]>({
    queryKey: ['variantText'],
    queryFn: fetchVariantText,
    onError: () => snackbar.error('Error: failed to get variants text.'),
  });

  const variantTextDeleteMutation = useMutation({
    mutationFn: deleteVariantText,
    onSuccess: () => {
      snackbar.success('Variant text deleted');
      queryClient.invalidateQueries(['variantText']);
    },
    onError: (err) => snackbar.error(`Error deleting variant text: ${err}`),
  });

  const variantTextUpdateMutation = useMutation({
    mutationFn: updateVariantText,
    onSuccess: () => {
      snackbar.success('Variant text updated');
      queryClient.invalidateQueries(['variantText']);
    },
    onError: (err) => snackbar.error(`Error deleting variant text: ${err}`),
  });

  const handleOnEdit = useCallback((rowData) => {
    setEditingData(rowData);
    setIsEditing(true);
  }, []);

  const handleOnAdd = useCallback(() => {
    setIsAdding(true);
  }, []);

  const handleOnDelete = useCallback((rowData: VariantTextType) => {
    setDeletingData(rowData);
  }, []);

  const handleDeleteClose = useCallback((confirmed: boolean) => {
    if (confirmed && deletingData) {
      variantTextDeleteMutation.mutate(deletingData);
    }
    setDeletingData(null);
  }, [deletingData, variantTextDeleteMutation]);

  const handleAddClose = useCallback((newData) => {
    if (newData) {
      queryClient.invalidateQueries(['variantText']);
    }
    setIsAdding(false);
  }, [queryClient]);

  const handleEditClose = useCallback(async (nextData) => {
    if (nextData) {
      variantTextUpdateMutation.mutate(nextData);
    }
    setIsEditing(false);
  }, [variantTextUpdateMutation]);

  if (isLoading) {
    return <CircularProgress />;
  }

  return (
    <section style={{ height: '100%', overflowY: 'auto' }}>
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
      <AlertDialog
        isOpen={Boolean(deletingData)}
        onClose={handleDeleteClose}
        title="Confirm Deleting Variant Text"
        text="Are you sure you want to delete this variant text?"
        confirmText="Confirm"
        cancelText="Cancel"
      />
      <AddEditVariantText
        editData={editingData}
        isOpen={isEditing}
        onClose={handleEditClose}
      />
      <AddEditVariantText
        isOpen={isAdding}
        onClose={handleAddClose}
      />
    </section>
  );
}
export default VariantText;
