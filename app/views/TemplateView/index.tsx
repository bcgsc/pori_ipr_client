import React, { useState, useCallback } from 'react';
import { useSnackbar } from 'notistack';
import { useQuery, useMutation, useQueryClient } from 'react-query';

import DataTable from '@/components/DataTable';
import api from '@/services/api';
import AddEditTemplate from './components/AddEditTemplate';
import columnDefs from './columnDefs';

const fetchTemplates = async () => api.get('/templates', {}).request();

const deleteTemplate = async (ident: string) => {
  await api.del(`/templates/${ident}/signature-types`, {}, {}).request();
  return api.del(`/templates/${ident}`, {}, {}).request();
};

const TemplateView = (): JSX.Element => {
  const [showDialog, setShowDialog] = useState(false);
  const [selectedRow, setSelectedRow] = useState();
  const snackbar = useSnackbar();
  const queryClient = useQueryClient();

  const { data: templates = [] } = useQuery({
    queryKey: ['templates'],
    queryFn: fetchTemplates,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      snackbar.enqueueSnackbar('Template deleted');
    },
    onError: (err) => {
      snackbar.enqueueSnackbar(`Error deleting template: ${err}`);
    },
  });

  const handleEditStart = (rowData) => {
    setShowDialog(true);
    if (rowData) {
      setSelectedRow(rowData);
    }
  };

  const handleDialogClose = useCallback((newData) => {
    setShowDialog(false);
    if (newData) {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
    }
    setSelectedRow(null);
  }, [queryClient]);

  const handleDelete = useCallback(async (rowData) => {
    try {
      deleteMutation.mutate(rowData.ident);
      snackbar.enqueueSnackbar('Template deleted');
    } catch (err) {
      snackbar.enqueueSnackbar(`Error deleting template: ${err}`);
    }
  }, [deleteMutation]);

  return (
    <div>
      <DataTable
        rowData={templates}
        columnDefs={columnDefs}
        titleText="Report Templates"
        canAdd
        onAdd={handleEditStart}
        addText="Create Template"
        canEdit
        onEdit={handleEditStart}
        canDelete
        onDelete={handleDelete}
      />
      <AddEditTemplate
        isOpen={showDialog}
        onClose={handleDialogClose}
        editData={selectedRow}
      />
    </div>
  );
};

export default TemplateView;
