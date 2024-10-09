import React, { useState, useEffect, useCallback } from 'react';
import { useSnackbar } from 'notistack';

import DataTable from '@/components/DataTable';
import api from '@/services/api';
import AddEditTemplate from './components/AddEditTemplate';
import columnDefs from './columnDefs';

const TemplateView = (): JSX.Element => {
  const [showDialog, setShowDialog] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [selectedRow, setSelectedRow] = useState();

  const snackbar = useSnackbar();

  useEffect(() => {
    const getData = async () => {
      const templatesResp = await api.get('/templates', {}).request();
      setTemplates(templatesResp);
    };
    getData();
  }, []);

  const handleEditStart = (rowData) => {
    setShowDialog(true);
    if (rowData) {
      setSelectedRow(rowData);
    }
  };

  const handleDialogClose = useCallback((newData) => {
    setShowDialog(false);
    if (newData) {
      const templateIndex = templates.findIndex((template) => template.ident === newData.ident);
      if (templateIndex !== -1) {
        const newTemplates = [...templates];
        newTemplates[templateIndex] = newData;
        setTemplates(newTemplates);
      } else {
        setTemplates((prevVal) => [...prevVal, newData]);
      }
    }
    setSelectedRow(null);
  }, [templates]);

  const handleDelete = useCallback(async (rowData) => {
    try {
      await api.del(`/templates/${rowData.ident}/signature-types`, {}, {}).request();
      await api.del(`/templates/${rowData.ident}`, {}, {}).request();
      setTemplates((prevVal) => prevVal.filter((template) => template.ident !== rowData.ident));
      snackbar.enqueueSnackbar('Template deleted');
    } catch (err) {
      snackbar.enqueueSnackbar(`Error deleting template: ${err}`);
    }
  }, [snackbar]);

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
