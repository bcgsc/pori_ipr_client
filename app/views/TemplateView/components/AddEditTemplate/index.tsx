import React, { useState, useCallback } from 'react';
import {
  Dialog,
  Button,
  ListItemText,
  Checkbox,
  MenuItem,
  TextField,
  Select,
  Typography,
  FormControl,
} from '@material-ui/core';

import sections from '../../sections';
import api from '@/services/api';

const AddEditTemplate = ({
  isOpen,
  onClose,
  editData,
}): JSX.Element => {
  const [templateName, setTemplateName] = useState('');
  const [selectedSections, setSelectedSections] = useState([]);

  const handleSubmit = useCallback(async () => {
    const newTemplate = {
      name: templateName,
      sections: selectedSections.map(section => section.value),
    };
    await api.post('/templates', newTemplate).request();
  }, [selectedSections, templateName]);

  return (
    <Dialog open={isOpen} onClose={onClose}>
      <Typography variant="h3">
        Create a new template
      </Typography>
      <FormControl variant="outlined">
        <TextField
          className="text-field-fix"
          title="Template name"
          label="Template name"
          value={templateName}
          onChange={(({ target: { value } }) => setTemplateName(value))}
          variant="outlined"
        />
        <Select
          multiple
          onChange={(({ target: { value } }) => setSelectedSections(value))}
          value={selectedSections}
          renderValue={() => selectedSections.map(section => section.name).join(', ')}
        >
          {sections.map(section => (
            <MenuItem key={section.name} value={section}>
              <Checkbox checked={selectedSections.includes(section)} />
              <ListItemText>{section.name}</ListItemText>
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <Button
        onClick={handleSubmit}
      >
        Create
      </Button>
    </Dialog>
  );
};

export default AddEditTemplate;
