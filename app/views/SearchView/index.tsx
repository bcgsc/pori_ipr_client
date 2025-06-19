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
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useHistory } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import React, { useCallback, useEffect, useState } from 'react';
import {
  MIN_KEYWORD_LENGTH,
  DEFAULT_THRESHOLD,
  ENTER_KEY,
  NUMPAD_ENTER_KEY,
  BACKSPACE_KEY,
} from '@/constants';

type SearchKeyType = {
  category: string;
  keyword: string;
  threshold: number;
};

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

const SearchView = () => {
  const [searchKey, setSearchKey] = useState<SearchKeyType[]>([]);
  const [searchThreshold, setSearchThreshold] = useState(DEFAULT_THRESHOLD);
  const [searchCategory, setSearchCategory] = useState('keyVariant');
  const [searchKeyword, setSearchKeyword] = useState('');
  const history = useHistory();
  const [searchErrorMessage, setSearchErrorMessage] = useState('');
  const [thresholdErrorMessage, setThresholdErrorMessage] = useState('');
  const customCss = useStyles();

  // Calls submit function
  const handleSubmit = useCallback(() => {
    if (!searchKey) {
      setSearchErrorMessage('Please enter a search keyword');
      return;
    }
    const searchUrl: string[] = [];
    searchKey.forEach((key) => searchUrl.push(`[${key.category}|${key.keyword}|${key.threshold}]`));
    history.push({
      pathname: '/search/result',
      search: `?searchParams=${searchUrl.join('')}`,
    });
  }, [searchKey, history]);

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

  const handleKeyDown = useCallback(({ code, target }) => {
    setSearchErrorMessage('');
    if (code === BACKSPACE_KEY && !target.value) {
      // Delete the last entry
      setSearchKey((currData) => currData.slice(0, -1));
    }
    if (code === ENTER_KEY || code === NUMPAD_ENTER_KEY) {
      // Allow user to press enter to submit search when there is no new character being entered for new keyword
      if (searchKey.length > 0 && !target.value) {
        setSearchErrorMessage('');
        const searchUrl: string[] = [];
        searchKey.forEach((key) => searchUrl.push(`[${key.category}|${key.keyword}|${key.threshold}]`));
        history.push({
          pathname: '/search/result',
          search: `?searchParams=${searchUrl.join('')}`,
        });
      }
      // Validate value
      if ((searchKey.length < 1 && target.value.length < MIN_KEYWORD_LENGTH ) || (searchKey.length > 0 && target.value.length > 0 && target.value.length < MIN_KEYWORD_LENGTH)) {
        setSearchErrorMessage(`Must have 1 or more terms of at least ${MIN_KEYWORD_LENGTH} characters`);
      } else {
        setSearchErrorMessage('');
        // Add new entry
        setSearchKey((currData) => [...currData, {
          category: searchCategory,
          keyword: searchKeyword,
          threshold: searchThreshold,
        } as SearchKeyType]);
      }
    }
  }, [searchKey, searchCategory, searchKeyword, searchThreshold]);

  return (
    <div className="search-view">
      <div className="search-view__bar">
        <div className="search-view__category-select">
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
        <div className="search-view__threshold-input">
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
        <div className="search-view__keyword-input">
          <Autocomplete
            multiple
            options={[]}
            freeSolo
            value={searchKey}
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
            renderTags={(value) => value.map(({ category, keyword, threshold }: SearchKeyType, index: number) => (
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
                placeholder={searchKey.length < 1 ? 'Press enter to add keyword. Press backspace to delete keyword.' : ''}
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
                          disabled={searchKey.length < 1 || !!searchErrorMessage || !!thresholdErrorMessage}
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
      <div className="error-dialog">
        <Typography variant="subtitle2" color="error">
          {searchErrorMessage}
        </Typography>
      </div>
      <div className="error-dialog">
        <Typography variant="subtitle2" color="error">
          {thresholdErrorMessage}
        </Typography>
      </div>
      <div className="help-dialog">
        <Typography variant="subtitle2" color="primary">
          The matching threshold scales from 0 to 1 and determines the cutoff of similarity between the search keyword and a match value.
          A threshold of 1 means the entire match value or a substring of it is identical to the search keyword. The default value is 0.8 if not specified.
        </Typography>
      </div>
    </div>
  );
};

export default SearchView;
