import React, { useState, useEffect, useCallback } from 'react';
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

import api from '@/services/api';

const Template = () => {
  const [name, setName] = useState('');
  const [sections, setSections] = useState([]);

  const handleSectionChange = useCallback(({ target: { value } }) => {
    setSections(value);
    // if (checked) {
    //   setSections(prevVal => [...prevVal, ])
    // } else {

    // }
  }, [sections]);

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
          value={name}
          onChange={(({ target: { value } }) => setName(value))}
          variant="outlined"
        />
        <Select
          multiple
          onChange={handleSectionChange}
          value={sections}
          renderValue={() => sections.join(', ')}
        >
          <MenuItem value="summary">
            <Checkbox checked={sections.includes('summary')} />
            <ListItemText>Summary</ListItemText>
          </MenuItem>
          <MenuItem value="appendices">
            <Checkbox checked={sections.includes('appendices')} />
            <ListItemText>Appendices</ListItemText>
          </MenuItem>
        </Select>
      </FormControl>
    </div>
  );
};

export default Template;
