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
  Checkbox,
  MenuItem,
  TextField,
  Typography,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import { useSnackbar } from 'notistack';

import { ImageType, RecordDefaults } from '@/common';
import api from '@/services/api';
import getImageDataURI from '@/utils/getImageDataURI';
import sections from '../../sections';

import './index.scss';

type AddEditTemplateProps = {
  isOpen: boolean;
  onClose: (newData?: Record<string, unknown>) => void;
  editData: {
    name: string;
    sections: string[];
    headerImage: ImageType | null;
    updatedAt: string | null;
  } & RecordDefaults;
};

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
  const [imageError, setImageError] = useState('');

  const snackbar = useSnackbar();

  useEffect(() => {
    if (editData) {
      setDialogTitle('Edit Template');
      setTemplateName(editData.name);
      setSelectedSections(sections.filter((section) => editData.sections.includes(section.value)));
      if (editData.headerImage) {
        setImagePreview(getImageDataURI(editData.headerImage));
      }
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

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const {
      target: { files },
    } = event;
    if (!files[0].name.match(/\.(jpg|jpeg|png)$/)) {
      setImageError('Please select a valid image (.jpg/.jpeg/.png)');
      return;
    }
    setImageError('');

    setHeaderImage(files[0]);
    const fileReader = new FileReader();
    fileReader.readAsDataURL(files[0]);
    fileReader.onload = () => setImagePreview(fileReader.result as string);
  };

  const handleSubmit = useCallback(async () => {
    if (templateName && selectedSections.length > 1) {
      try {
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
        snackbar.enqueueSnackbar(`Template ${editData ? 'updated' : 'created'} successfully`);
        onClose(resp);
      } catch (err) {
        snackbar.enqueueSnackbar(`Error ${editData ? 'updating' : 'creating'} template: ${err}`);
      }
    } else if (templateName && selectedSections.length) {
      try {
        interface TemplatePayload extends Record<string, unknown> {
          name: string,
          sections: string[],
          header?: string,
        }

        const newData: TemplatePayload = {
          name: templateName,
          sections: [selectedSections[0].value],
        };

        if (headerImage) {
          newData.header = JSON.stringify(headerImage);
        }

        let resp;
        if (editData) {
          resp = await api.put(`/templates/${editData.ident}`, newData, {}, false).request();
        } else {
          resp = await api.post('/templates', newData, {}, false).request();
        }
        snackbar.enqueueSnackbar(`Template ${editData ? 'updated' : 'created'} successfully`);
        onClose(resp);
      } catch (err) {
        snackbar.enqueueSnackbar(`Error ${editData ? 'updating' : 'creating'} template: ${err}`);
      }
    }
  }, [editData, headerImage, onClose, selectedSections, snackbar, templateName]);

  return (
    <Dialog open={isOpen} onClose={() => onClose(null)}>
      <DialogTitle>{dialogTitle}</DialogTitle>
      <DialogContent>
        {editData && (
          <>
            <UserAutocomplete
              onSubmit={handleAddUser}
              label="Add user to group"
            />
            <DataTable
              rowData={users}
              columnDefs={columnDefs}
              canViewDetails={false}
              onDelete={handleDeleteUser}
              canDelete
            />
          </>
        )}
      </DialogContent>
      <DialogContent>
        {editData && (
        <>
          <UserAutocomplete
            onSubmit={handleAddUser}
            label="Add user to group"
          />
          <DataTable
            rowData={users}
            columnDefs={columnDefs}
            canViewDetails={false}
            onDelete={handleDeleteUser}
            canDelete
          />
        </>
        )}
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => onClose(null)}
          color="secondary"
        >
          Close
        </Button>
        <Button
          onClick={handleSubmit}
          color="secondary"
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddEditTemplate;
