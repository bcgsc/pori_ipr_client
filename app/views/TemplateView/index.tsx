import React, { useState, useCallback } from 'react';
import { useMutation } from 'react-query';
import snackbar from '@/services/SnackbarUtils';

import DataTable from '@/components/DataTable';
import api from '@/services/api';
import { TemplateType } from '@/common';
import { useTemplatesAll } from '@/queries/get';
import AddEditTemplate from './components/AddEditTemplate';
import columnDefs from './columnDefs';

const deleteTemplate = async (ident: string) => {
  await api.del(`/templates/${ident}/signature-types`, {}, {}).request();
  return api.del(`/templates/${ident}`, {}, {}).request();
};

const TemplateView = (): JSX.Element => {
  const [showDialog, setShowDialog] = useState(false);
  const [selectedRow, setSelectedRow] = useState();

  const {
    data: templates = [],
    refetch: refetchTemplates,
  } = useTemplatesAll<TemplateType[]>();

  const deleteMutation = useMutation({
    mutationFn: deleteTemplate,
    onSuccess: () => {
      snackbar.success('Template deleted');
      refetchTemplates();
    },
    onError: (err) => {
      snackbar.error(`Error deleting template: ${err}`);
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
      refetchTemplates();
    }
    setSelectedRow(null);
  }, [refetchTemplates]);

  const handleDelete = useCallback(async (rowData) => {
    try {
      deleteMutation.mutate(rowData.ident);
      snackbar.success('Template deleted');
    } catch (err) {
      snackbar.error(`Error deleting template: ${err}`);
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
export {
  TemplateView,
  deleteTemplate,
};
