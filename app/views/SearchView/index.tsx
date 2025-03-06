import {
  TextField,
  Typography,
  InputAdornment,
  IconButton,
  Box,
  Tab,
  Tabs,
} from '@mui/material';
import { useHistory } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import ArrowCircleRightIcon from '@mui/icons-material/ArrowCircleRight';
import React, { useCallback, useEffect, useState } from 'react';
import {
  MIN_KEYWORD_LENGTH,
  DEFAULT_THRESHOLD,
  ENTER_KEY,
} from '@/constants';

const SearchView = () => {
  const [searchKey, setSearchKey] = useState('');
  const [threshold, setThreshold] = useState('');
  const [searchCategory, setSearchCategory] = React.useState('patientId');
  const history = useHistory();
  const [searchErrorMessage, setSearchErrorMessage] = useState('');
  const [thresholdErrorMessage, setThresholdErrorMessage] = useState('');

  // Calls submit function
  const handleSubmit = useCallback(() => {
    if (!searchKey) {
      setSearchErrorMessage('Please enter a search keyword');
      return;
    }
    switch (searchCategory) {
      case 'patientId':
        history.push({
          pathname: '/search/result',
          search: `?patientId=${searchKey}&matchingThreshold=${threshold || DEFAULT_THRESHOLD}`,
        });
        break;
      case 'projectName':
        history.push({
          pathname: '/search/result',
          search: `?projectName=${searchKey}&matchingThreshold=${threshold || DEFAULT_THRESHOLD}`,
        });
        break;
      case 'diagnosis':
        history.push({
          pathname: '/search/result',
          search: `?diagnosis=${searchKey}&matchingThreshold=${threshold || DEFAULT_THRESHOLD}`,
        });
        break;
      case 'keyVariant':
        history.push({
          pathname: '/search/result',
          search: `?keyVariant=${searchKey}&matchingThreshold=${threshold || DEFAULT_THRESHOLD}`,
        });
        break;
      case 'kbVariant':
        history.push({
          pathname: '/search/result',
          search: `?kbVariant=${searchKey}&matchingThreshold=${threshold || DEFAULT_THRESHOLD}`,
        });
        break;
      default:
        break;
    }
  }, [searchKey, searchCategory, history, threshold]);

  // Validate search key and threshold values
  useEffect(() => {
    if (!searchKey) {
      setSearchErrorMessage('');
    } else {
      const trimmed = String(searchKey)
        .trim()
        .toLowerCase()
        .split(/\s+/)
        .filter((word) => word.length >= MIN_KEYWORD_LENGTH);

      if (!trimmed.length) {
        setSearchErrorMessage(`Must have 1 or more terms of at least ${MIN_KEYWORD_LENGTH} characters`);
      } else {
        setSearchErrorMessage('');
      }
    }

    if (!threshold) {
      setThresholdErrorMessage('');
    } else {
      const numThreshold = parseFloat(threshold);
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
  }, [threshold, searchKey, searchCategory]);

  const handleSearchKeyChange = useCallback((event) => {
    const newSearchKey = event.target.value;

    if (newSearchKey !== searchKey) {
      setSearchKey(newSearchKey);
    }
  }, [searchKey]);

  const handleCategoryChange = (event: React.SyntheticEvent, searchCat: string) => {
    setSearchCategory(searchCat);
  };

  const handleThresholdChange = useCallback((event) => {
    const newThreshold = event.target.value;

    if (newThreshold !== threshold) {
      setThreshold(newThreshold);
    }
  }, [threshold]);

  return (
    <div className="search-view">
      <Box paddingBottom={1}>
        <Tabs
          value={searchCategory}
          onChange={handleCategoryChange}
          centered
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label="Patient ID" value="patientId" />
          <Tab label="Project Name" value="projectName" />
          <Tab label="Diagnosis" value="diagnosis" />
          <Tab label="Key Variant" value="keyVariant" />
          <Tab label="KB Matched Variant" value="kbVariant" />
        </Tabs>
      </Box>
      <div className="search-view__bar">
        <div
          className="search-view__main"
          onKeyUp={(event) => event.key === ENTER_KEY && handleSubmit()}
          role="textbox"
          tabIndex={0}
        >
          <TextField
            variant="outlined"
            error={Boolean(searchErrorMessage)}
            fullWidth
            helperText={searchErrorMessage}
            onChange={handleSearchKeyChange}
            placeholder="Enter search keyword"
            value={searchKey}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton color="primary" onClick={handleSubmit} disabled={!!searchErrorMessage || !!thresholdErrorMessage} type="submit">
                    <ArrowCircleRightIcon />
                  </IconButton>
                </InputAdornment>
              ),
              sx: { borderRadius: '20px' },
            }}
          />
        </div>
        <div className="search-view__threshold-input">
          <TextField
            label="Threshold"
            InputLabelProps={{ shrink: true }}
            size="medium"
            variant="outlined"
            helperText={thresholdErrorMessage}
            error={Boolean(thresholdErrorMessage)}
            onChange={handleThresholdChange}
            value={threshold}
            placeholder={DEFAULT_THRESHOLD}
            inputProps={{
              type: 'number',
              sx: { textAlign: 'center' },
              onKeyUp: (event) => event.key === ENTER_KEY && handleSubmit(),
            }}
          />
        </div>
      </div>
      <div className="help-dialog">
        <Typography variant="subtitle2" color="primary">
          The matching threshold determines the cutoff of similarity between the keyword and its matched results.
          A value of 1 means a 100% match. The default value is 0.8 if not specified.
        </Typography>
      </div>
    </div>
  );
};

export default SearchView;
