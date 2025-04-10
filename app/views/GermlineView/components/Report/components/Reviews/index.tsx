import React, {
  useState, useCallback, useEffect, useContext,
} from 'react';
import {
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import { AgGridReact } from '@ag-grid-community/react';

import GermlineReportContext from '@/context/GermlineReportContext';
import api from '@/services/api';
import snackbar from '@/services/SnackbarUtils';
import DeleteCell from './components/DeleteCell';
import columnDefs from './columnDefs';

import './index.scss';

const Reviews = (): JSX.Element => {
  const { report, setReport } = useContext(GermlineReportContext);

  const [isEditing, setIsEditing] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [newType, setNewType] = useState('');

  useEffect(() => {
    if (!isEditing) {
      setNewComment('');
      setNewType('');
    }
  }, [isEditing]);

  const handleAddReview = useCallback(async () => {
    try {
      const newReview = await api.post(
        `/germline-small-mutation-reports/${report.ident}/reviews`,
        { type: newType, comment: newComment },
        {},
      ).request();
      setReport((prevVal) => ({
        ...prevVal,
        reviews: [...prevVal.reviews, newReview],
      }));
      setIsEditing(false);
      snackbar.success('Review added');
    } catch (err) {
      snackbar.error(`Error adding review: ${err}`);
    }
  }, [newComment, newType, report, setReport]);

  const handleRowDelete = useCallback(async (row) => {
    try {
      api.del(
        `/germline-small-mutation-reports/${report.ident}/reviews/${row.data.ident}`,
        {},
        {},
      ).request();
      setReport((prevVal) => ({
        ...prevVal,
        reviews: prevVal.reviews.filter((val) => val.ident !== row.data.ident),
      }));
      snackbar.success('Review removed');
    } catch (err) {
      snackbar.error(`Error removing review: ${err}`);
    }
  }, [report, setReport]);

  const DeleteCellRenderer = useCallback((row) => (
    <DeleteCell
      onDelete={() => handleRowDelete(row)}
    />
  ), [handleRowDelete]);

  return (
    <div className="reviews">
      <Typography variant="h5">Reviews</Typography>
      <div className="ag-theme-material">
        <AgGridReact
          columnDefs={columnDefs}
          domLayout="autoHeight"
          rowData={report.reviews}
          defaultColDef={{
            resizable: true,
          }}
          frameworkComponents={{
            deleteCell: DeleteCellRenderer,
          }}
        />
      </div>
      {report.reviews.length < 2 && (
        <div>
          {!isEditing ? (
            <Button
              className="reviews__button"
              color="secondary"
              onClick={() => setIsEditing(true)}
              variant="outlined"
            >
              Add Review
            </Button>
          ) : (
            <div className="reviews__add-new">
              <TextField
                label="Comment"
                size="small"
                multiline
                onChange={(event) => setNewComment(event.target.value)}
                value={newComment}
                variant="outlined"
              />
              <FormControl fullWidth size="small" variant="outlined">
                <InputLabel htmlFor="review-select">Type</InputLabel>
                <Select
                  fullWidth
                  label="Type"
                  onChange={(event) => setNewType(event.target.value as string)}
                  name="review-select"
                  value={newType}
                  variant="outlined"
                >
                  <MenuItem value="biofx">BioFX</MenuItem>
                  <MenuItem value="projects">Projects</MenuItem>
                  <MenuItem value="cgl">CGL</MenuItem>
                </Select>
              </FormControl>
              <div className="reviews__buttons">
                <Button
                  color="secondary"
                  disabled={!newType}
                  onClick={handleAddReview}
                  variant="outlined"
                >
                  Add Review
                </Button>
                <Button
                  onClick={() => setIsEditing(false)}
                  variant="outlined"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Reviews;
