import React, { useState, useEffect, useCallback } from 'react';
import {
  Typography,
} from '@material-ui/core';

import api from '../../services/api';
import AddEditTemplate from './components/AddEditTemplate';
import DataTable from '@/components/DataTable';
import columnDefs from './columnDefs';


const TemplateView = (): JSX.Element => {
  const [showDialog, setShowDialog] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [selectedRow, setSelectedRow] = useState();

  useEffect(() => {
    const getData = async () => {
      const templatesResp = await api.get('/templates', {}).request();
      setTemplates(templatesResp);
    };
    getData();
  }, []);

  const handleEditStart = useCallback((rowData) => {
    setShowDialog(true);
    if (rowData) {
      setSelectedRow(rowData);
    }
  }, []);

  const handleDialogClose = useCallback((newData) => {
    setShowDialog(false);
    if (newData) {
      const templateIndex = templates.findIndex(template => template.ident === newData.ident);
      if (templateIndex !== -1) {
        const newTemplates = [...templates];
        newTemplates[templateIndex] = newData;
        setTemplates(newTemplates);
      } else {
        setTemplates(prevVal => [...prevVal, newData]);
      }
    }
    setSelectedRow(null);
  }, [templates]);

  return (
    <div>
      <Typography variant="h3">
        Template Management
      </Typography>
      <DataTable
        rowData={templates}
        columnDefs={columnDefs}
        titleText="Templates"
        canAdd
        onAdd={handleEditStart}
        addText="Create template"
        canEdit
        onEdit={handleEditStart}
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
