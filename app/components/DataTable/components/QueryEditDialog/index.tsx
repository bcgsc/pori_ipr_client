import {
  TextField,
  Typography,
  Button,
  Chip,
  Autocomplete,
  FormControl,
  MenuItem,
  Select,
  SelectChangeEvent,
  InputAdornment,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  CircularProgress,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useHistory } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import ManageSearchIcon from '@mui/icons-material/ManageSearch';
import React, { useCallback, useEffect, useState } from 'react';
import { SearchParamsType } from '@/context/SearchParamsContext';
import useSearchParams from '@/hooks/useSearchParams';

import './index.scss';

import {
  MIN_KEYWORD_LENGTH,
  DEFAULT_THRESHOLD,
  ENTER_KEY,
  NUMPAD_ENTER_KEY,
  BACKSPACE_KEY,
} from '@/constants';
import { useQueryClient } from 'react-query';

// Custom css to alter select dropdown border radius
const useStyles = makeStyles({
  categoryBorder: {
    '& .MuiOutlinedInput-notchedOutline': {
      borderTopLeftRadius: '25px',
      borderBottomLeftRadius: '25px',
      borderTopRightRadius: '0px',
      borderBottomRightRadius: '0px',
    },
  },
});

const SearchBar = ({ onSuccess }: { onSuccess: (searchParams: SearchParamsType[]) => void }) => {
  const { searchParams, setSearchParams } = useSearchParams();
  const [searchThreshold, setSearchThreshold] = useState(DEFAULT_THRESHOLD);
  const [searchCategory, setSearchCategory] = useState('keyVariant');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchErrorMessage, setSearchErrorMessage] = useState('');
  const [thresholdErrorMessage, setThresholdErrorMessage] = useState('');
  const customCss = useStyles();

  // Validate threshold value
  useEffect(() => {
    if (!searchThreshold) {
      setThresholdErrorMessage('Threshold must not be empty');
    } else {
      const numThreshold = parseFloat(searchThreshold);
      if (!Number.isNaN(numThreshold)) {
        if (numThreshold < 0 || numThreshold > 1) {
          setThresholdErrorMessage('Threshold must be between 0 and 1');
        } else {
          setThresholdErrorMessage('');
        }
      } else {
        setThresholdErrorMessage('Threshold must be a number');
      }
    }
  }, [searchThreshold]);

  const handleCategoryChange = (event: SelectChangeEvent) => {
    setSearchCategory(event.target.value);
  };

  const handleThresholdChange = useCallback((event) => {
    const newThreshold = event.target.value;

    if (newThreshold !== searchThreshold) {
      setSearchThreshold(newThreshold);
    }
  }, [searchThreshold]);

  const handleKeywordChange = useCallback((event) => {
    const newKeyword = event.target.value;

    if (newKeyword !== searchKeyword) {
      setSearchKeyword(newKeyword);
    }
  }, [searchKeyword]);

  // Calls submit function
  const handleSubmit = useCallback(() => {
    if (!searchParams) {
      setSearchErrorMessage('Please enter a search keyword');
      return;
    }
    onSuccess(searchParams);
  }, [searchParams, onSuccess]);

  const handleKeyDown = useCallback((e) => {
    const { code, target } = e;
    setSearchErrorMessage('');
    if (code === BACKSPACE_KEY && !target.value) {
      // Delete the last entry
      setSearchParams((currData) => currData.slice(0, -1));
    }
    if (code === ENTER_KEY || code === NUMPAD_ENTER_KEY) {
      e.preventDefault();
      // Allow user to press enter to submit search when there is no new character being entered for new keyword
      if (searchParams.length > 0 && !target.value) {
        setSearchErrorMessage('');
        handleSubmit();
        return;
      }
      // Validate value
      if (
        (searchParams.length < 1 && target.value.length < MIN_KEYWORD_LENGTH) ||
        (searchParams.length > 0 && target.value.length > 0 && target.value.length < MIN_KEYWORD_LENGTH)
      ) {
        setSearchErrorMessage(`Must have 1 or more terms of at least ${MIN_KEYWORD_LENGTH} characters`);
        return;
      }
      setSearchErrorMessage('');
      // Add new entry
      setSearchParams([
        ...searchParams,
        {
          category: searchCategory,
          keyword: searchKeyword,
          threshold: searchThreshold,
        },
      ]);
      setSearchKeyword('');
    }
  }, [searchParams, searchCategory, searchKeyword, searchThreshold, handleSubmit]);
  
  return (
    <div className="query-edit-dialog-search">
      <div className="query-edit-dialog-search__bar">
        <div className="query-edit-dialog-search__category-select">
          <FormControl classes={{ root: customCss.categoryBorder }} style={{ height: '100%' }}>
            <Select
              value={searchCategory}
              onChange={handleCategoryChange}
              displayEmpty
              style={{
                height: '100%',
                width: '100%',
                minWidth: '200px',
              }}
              inputProps={{
                sx: {
                  textAlign: 'center',
                },
              }}
            >
              <MenuItem value="keyVariant">Key Variant</MenuItem>
              <MenuItem value="kbVariant">KB Variant</MenuItem>
              <MenuItem value="patientId">Patient ID</MenuItem>
              <MenuItem value="projectName">Project Name</MenuItem>
              <MenuItem value="diagnosis">Diagnosis</MenuItem>
              <MenuItem value="therapeuticTarget">Therapeutic Target</MenuItem>
              <MenuItem value="smallMutation">Small Mutation</MenuItem>
              <MenuItem value="structuralVariant">Structural Variant</MenuItem>
            </Select>
          </FormControl>
        </div>
        <div className="query-edit-dialog-search__threshold-input">
          <TextField
            InputLabelProps={{ shrink: true }}
            variant="outlined"
            error={Boolean(thresholdErrorMessage)}
            onChange={handleThresholdChange}
            value={searchThreshold}
            defaultValue={DEFAULT_THRESHOLD}
            placeholder="0.8"
            onKeyDown={handleKeyDown}
            inputProps={{
              sx: {
                textAlign: 'center',
                height: 'inherit',
                width: '100%',
              },
            }}
            // eslint-disable-next-line react/jsx-no-duplicate-props
            InputProps={{
              type: 'number',
              sx: {
                borderRadius: '0px',
                height: '100%',
                minWidth: '70px',
              },
            }}
          />
        </div>
        <div className="query-edit-dialog-search__keyword-input">
          <Autocomplete
            multiple
            options={[]}
            freeSolo
            value={searchParams}
            disableClearable
            sx={{
              '& fieldset': {
                borderTopLeftRadius: '0px',
                borderBottomLeftRadius: '0px',
                borderTopRightRadius: '25px',
                borderBottomRightRadius: '25px',
              },
              height: 'inherit',
              width: '100%',
            }}
            limitTags={4}
            renderTags={(value) => value.map(({ category, keyword, threshold }: SearchParamsType, index: number) => (
              <Chip
                variant="outlined"
                // eslint-disable-next-line react/no-array-index-key
                key={`${keyword}-${index}`}
                label={`${category} | ${keyword} | ${threshold}`}
                sx={{ marginRight: '5px' }}
              />
            ))}
            renderInput={(params) => (
              <TextField
                {...params}
                name="keyword"
                variant="outlined"
                error={Boolean(searchErrorMessage)}
                onChange={handleKeywordChange}
                onKeyDown={handleKeyDown}
                placeholder={searchParams.length < 1 ? 'After inputting a keyword, press enter to add search chip. Press backspace to delete.' : ''}
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      <InputAdornment position="end">
                        <Button
                          variant="contained"
                          color="primary"
                          size="large"
                          onClick={handleSubmit}
                          disabled={searchParams.length < 1 || !!searchErrorMessage || !!thresholdErrorMessage}
                          type="submit"
                          sx={{
                            display: 'flex',
                            padding: '8px',
                            minHeight: 0,
                            minWidth: 0,
                            borderRadius: '25px',
                          }}
                        >
                          <SearchIcon />
                        </Button>
                      </InputAdornment>
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
          />
        </div>
      </div>
      <div className="query-edit-dialog-search__error-dialog">
        <Typography variant="subtitle2" color="error">
          {searchErrorMessage}
        </Typography>
      </div>
      <div className="query-edit-dialog-search__error-dialog">
        <Typography variant="subtitle2" color="error">
          {thresholdErrorMessage}
        </Typography>
      </div>
    </div>
  );
};

const QueryEditDialog = ({isApiLoading}) => {
  const [showQueryEditDialog, setShowQueryEditDialog] = useState<boolean>(false);
  const history = useHistory();
  const queryClient = useQueryClient();

  const openQueryEdit = useCallback(() => {
    setShowQueryEditDialog(true);
  }, []);

  const closeQueryEdit = useCallback(() => {
    setShowQueryEditDialog(false);
  }, []);

  const handleQueryEdit = useCallback((searchParams) => {
    closeQueryEdit();

    if (searchParams) {
      const searchUrl = searchParams
        .map((key) => `[${key.category}|${key.keyword}|${key.threshold}]`)
        .join('');
      history.replace({
        pathname: '/search/result',
        search: encodeURIComponent(`searchParams=${searchUrl}`),
      });
      queryClient.refetchQueries({
        queryKey: [`/reports?searchParams=${searchUrl}`]
      });
    }
  }, [history]);

  return (
    <>
      <span className="query-edit-dialog__action">
        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={openQueryEdit}
          disabled={isApiLoading}
          style={{
            borderRadius: 10,
            padding: '4px 8px',
          }}
        >
          {
            isApiLoading 
              ? <CircularProgress sx={{ marginRight: '4px' }} /> 
              : <ManageSearchIcon sx={{ marginRight: '4px' }} />
          }
          Edit Query
        </Button>
      </span>
      <Dialog open={showQueryEditDialog} onClose={closeQueryEdit} maxWidth="lg" fullWidth>
        <DialogTitle>
          <Typography variant="h3" color="primary">
            Edit Query
          </Typography>
        </DialogTitle>
        <DialogContent >
          <SearchBar onSuccess={handleQueryEdit}/>
        </DialogContent>
        <DialogActions>
          <Button color="secondary" onClick={closeQueryEdit}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default QueryEditDialog;