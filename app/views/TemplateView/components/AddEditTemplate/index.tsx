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
import api, { ApiCallSet } from '@/services/api';
import getImageDataURI from '@/utils/getImageDataURI';
import sections from '../../sections';
import signatureTypes from '../../signatureTypes';
import { SignatureUserType } from '@/components/SignatureCard';

import './index.scss';

type AddEditTemplateProps = {
  isOpen: boolean;
  onClose: (newData?: Record<string, unknown>) => void;
  editData: {
    name: string;
    sections: string[];
    signatureTypes: SignatureUserType[] | null;
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
  const [selectedSignatureTypes, setSelectedSignatureTypes] = useState([]);
  const [headerImage, setHeaderImage] = useState<Blob>();
  const [imagePreview, setImagePreview] = useState('');
  const [imageError, setImageError] = useState('');

  const snackbar = useSnackbar();

  useEffect(() => {
    if (editData) {
      setDialogTitle('Edit Template');
      setTemplateName(editData.name);
      setSelectedSections(sections.filter((section) => editData.sections.includes(section.value)));
      if (editData.signatureTypes && editData.signatureTypes.length > 0) {
        setSelectedSignatureTypes(signatureTypes.filter((signatureType) => editData.signatureTypes.map((val) => val.signatureType).includes(signatureType.value)));
      }
      if (editData.headerImage) {
        setImagePreview(getImageDataURI(editData.headerImage));
      }
    } else {
      setDialogTitle('Create a Template');
      setTemplateName('');
      setSelectedSections([]);
      setSelectedSignatureTypes([]);
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
        let apiCalls = [];
        if (editData) {
          resp = await api.put(`/templates/${editData.ident}`, newTemplate, {}, true).request();
        } else {
          resp = await api.post('/templates', newTemplate, {}, true).request();
        }
        if (selectedSignatureTypes && selectedSignatureTypes.length > 0) {
          selectedSignatureTypes.forEach((signatureType) => {
            const newSignatureType = new FormData();
            newSignatureType.append('signatureType', signatureType.value);
            apiCalls.push(api.post(`/templates/${resp.ident}/signature-types`, newSignatureType, {}, true));
          });
          const callSet = new ApiCallSet(apiCalls);
          resp.signatureTypes = await callSet.request();
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
        let apiCalls = [];
        if (editData) {
          resp = await api.put(`/templates/${editData.ident}`, newData, {}, false).request();
        } else {
          resp = await api.post('/templates', newData, {}, false).request();
        }
        if (selectedSignatureTypes && selectedSignatureTypes.length > 0) {
          selectedSignatureTypes.forEach((signatureType) => {
            const newSignatureType = new FormData();
            newSignatureType.append('signatureType', signatureType.value);
            apiCalls.push(api.post(`/templates/${resp.ident}/signature-types`, newSignatureType, {}, true));
          });
          const callSet = new ApiCallSet(apiCalls);
          resp.signatureTypes = await callSet.request();
        }
        snackbar.enqueueSnackbar(`Template ${editData ? 'updated' : 'created'} successfully`);
        onClose(resp);
      } catch (err) {
        snackbar.enqueueSnackbar(`Error ${editData ? 'updating' : 'creating'} template: ${err}`);
      }
    }
  }, [editData, headerImage, onClose, selectedSections, selectedSignatureTypes, snackbar, templateName]);

  return (
    <Dialog open={isOpen} onClose={() => onClose(null)}>
      <DialogTitle>{dialogTitle}</DialogTitle>
      <DialogContent>
        <FormControl fullWidth variant="outlined">
          <TextField
            className="template__name"
            label="Template name"
            onChange={(({ target: { value } }) => setTemplateName(value))}
            required
            title="Template name"
            value={templateName}
            variant="outlined"
          />
        </FormControl>
        <FormControl required fullWidth variant="outlined">
          <InputLabel className="template__sections" id="select-sections">Sections</InputLabel>
          <Select
            autoWidth
            className="template__sections"
            label="Sections"
            labelId="select-sections"
            multiple
            onChange={(({ target: { value } }) => setSelectedSections(value as string[]))}
            renderValue={() => selectedSections.map((section) => section.name).join(', ')}
            value={selectedSections}
          >
            {sections.map((section) => (
              <MenuItem key={section.name} value={section}>
                <Checkbox checked={selectedSections.includes(section)} />
                <ListItemText>{section.name}</ListItemText>
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl required fullWidth variant="outlined">
          <InputLabel className="template__signature" id="select-signature-type">Signature Type</InputLabel>
          <Select
            autoWidth
            className="template__signature"
            label="Signature Type"
            labelId="select-signature-type"
            multiple
            onChange={(({ target: { value } }) => setSelectedSignatureTypes(value as string[]))}
            renderValue={() => selectedSignatureTypes.map((signatureType) => signatureType.name).join(', ')}
            value={selectedSignatureTypes}
          >
            {signatureTypes.map((signatureType) => (
              <MenuItem key={signatureType.name} value={signatureType}>
                <Checkbox checked={selectedSignatureTypes.includes(signatureType)} />
                <ListItemText>{signatureType.name}</ListItemText>
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Typography variant="h5" className="template__image-text">
          Print Report Header Image
        </Typography>
        <Typography variant="subtitle1" className="template__image-subtitle">
          This will be resized to 300 x 96
        </Typography>
        {imagePreview ? (
          <div className="template__image">
            <img
              height={96}
              width={300}
              alt="Header preview"
              src={imagePreview}
            />
            <IconButton onClick={handleImageDelete} className="image__delete" size="large">
              <HighlightOffIcon />
            </IconButton>
          </div>
        ) : (
          <div className="template__upload">
            <Button
              variant="outlined"
              component="label"
              color="secondary"
            >
              Upload image
              <input
                accept=".png,.jpg,.jpeg"
                onChange={handleImageUpload}
                type="file"
                hidden
              />
            </Button>
            {imageError && (
              <Typography color="error" className="template__upload-error">
                {imageError}
              </Typography>
            )}
          </div>
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
