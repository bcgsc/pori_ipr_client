import React, {
  useState, useCallback, useEffect,
} from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Button,
  ListItemText,
  Input,
  Checkbox,
  MenuItem,
  TextField,
  Typography,
  Select,
  FormControl,
  InputLabel,
} from '@material-ui/core';
import HighlightOffIcon from '@material-ui/icons/HighlightOff';

import { recordDefaults } from '@/common';
import sections from '../../sections';
import api from '@/services/api';

import './index.scss';

type AddEditTemplateProps = {
  isOpen: boolean;
  onClose: (newData?: Record<string, unknown>) => void;
  editData: {
    name: string;
    sections: string[];
    headerImage: {
      data: string | null;
      fileName: string | null;
      format: string | null;
      type: string | null;
      updatedAt: string | null;
    } & recordDefaults;
    updatedAt: string | null;
  } & recordDefaults;
}

const AddEditTemplate = ({
  isOpen,
  onClose,
  editData,
}: AddEditTemplateProps): JSX.Element => {
  const [dialogTitle, setDialogTitle] = useState('');
  const [templateName, setTemplateName] = useState('');
  const [selectedSections, setSelectedSections] = useState([]);
  const [headerImage, setHeaderImage] = useState<Blob>();
  const [imagePreview, setImagePreview] = useState('');

  useEffect(() => {
    if (editData) {
      setDialogTitle('Edit Template');
      setTemplateName(editData.name);
      setSelectedSections(sections.filter(section => editData.sections.includes(section.value)));
      setImagePreview(editData.headerImage.data);
    } else {
      setDialogTitle('Create a Template');
      setTemplateName('');
      setSelectedSections([]);
      setImagePreview('');
    }
  }, [editData]);

  const handleImageDelete = () => {
    setHeaderImage(null);
    setImagePreview('');
  };

  const handleImageUpload = (event) => {
    const {
      target: { files },
    } = event;
    setHeaderImage(files[0]);
    const fileReader = new FileReader();
    fileReader.readAsDataURL(files[0]);
    fileReader.onload = () => setImagePreview(fileReader.result as string);
  };

  const handleSubmit = useCallback(async () => {
    if (templateName && selectedSections.length) {
      const newTemplate = new FormData();

      newTemplate.append('name', templateName);
      selectedSections.forEach((section) => {
        newTemplate.append('sections', section.value);
      });
      if (headerImage) {
        newTemplate.append('header', headerImage);
      }

      let resp;
      if (editData) {
        resp = await api.put(`/templates/${editData.ident}`, newTemplate, {}, true).request();
      } else {
        resp = await api.post('/templates', newTemplate, {}, true).request();
      }
      onClose(resp);
    }
  }, [editData, headerImage, onClose, selectedSections, templateName]);

  return (
    <Dialog open={isOpen} onClose={() => onClose(null)}>
      <DialogTitle>{dialogTitle}</DialogTitle>
      <DialogContent>
        <FormControl fullWidth variant="outlined">
          <TextField
            className="text-field-fix"
            label="Template name"
            onChange={(({ target: { value } }) => setTemplateName(value))}
            required
            title="Template name"
            value={templateName}
            variant="outlined"
          />
        </FormControl>
        <FormControl required fullWidth variant="outlined">
          <InputLabel className="sections__select" id="select-sections">Sections</InputLabel>
          <Select
            autoWidth
            className="sections__select"
            label="Sections"
            labelId="select-sections"
            multiple
            onChange={(({ target: { value } }) => setSelectedSections(value as string[]))}
            renderValue={() => selectedSections.map(section => section.name).join(', ')}
            value={selectedSections}
          >
            {sections.map(section => (
              <MenuItem key={section.name} value={section}>
                <Checkbox checked={selectedSections.includes(section)} />
                <ListItemText>{section.name}</ListItemText>
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Typography>Printed Report Header Image (96px x 300px)</Typography>
        {imagePreview ? (
          <>
            <img
              height={96}
              width={300}
              alt="Header preview"
              src={imagePreview}
            />
            <IconButton onClick={handleImageDelete} className="image__delete">
              <HighlightOffIcon />
            </IconButton>
          </>
        ) : (
          <Input
            onChange={handleImageUpload}
            type="file"
          />
        )}
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => onClose(null)}
        >
          Close
        </Button>
        <Button
          onClick={handleSubmit}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddEditTemplate;
