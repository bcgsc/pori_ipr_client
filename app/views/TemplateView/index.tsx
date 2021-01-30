import React, { useState } from 'react';
import {
  Button,
  ListItemText,
  Checkbox,
  MenuItem,
  TextField,
  Select,
  Typography,
  FormControl,
} from '@material-ui/core';

import sections from './sections';
import api from '@/services/api';

const Template = (): JSX.Element => {
  const [templateName, setTemplateName] = useState('');
  const [selectedSections, setSelectedSections] = useState([]);

  return (
    <div>
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
    </div>
  );
};

export default Template;
