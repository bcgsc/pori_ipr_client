import {
  TextField,
  Typography,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { useHistory } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import ArrowCircleRightIcon from '@mui/icons-material/ArrowCircleRight';
import React, { useCallback, useEffect, useState } from 'react';

const MIN_WORD_LENGTH = 2;

const SearchByKbmatchView = () => {
  const [variant, setVariant] = useState('');
  const [threshold, setThreshold] = useState('');
  const history = useHistory();
  const [variantErrorMessage, setVariantErrorMessage] = useState('');
  const [thresholdErrorMessage, setThresholdErrorMessage] = useState('');
  const DEFAULT_THRESHOLD = '0.8';
  const ENTER_KEY = 'Enter';

  // Calls submit function
  const handleSubmit = useCallback(() => {
    if (!variant) {
      setVariantErrorMessage('Please enter a kb variant');
      return;
    }

    history.push({
      pathname: '/search-by-kbmatches/result',
      search: `?kbVariant=${variant}&matchingThreshold=${threshold || DEFAULT_THRESHOLD}`,
    });
  }, [variant, threshold, history]);

  // Validate key variant and threshold values
  useEffect(() => {
    if (!variant) {
      setVariantErrorMessage('');
    } else {
      const trimmed = String(variant)
        .trim()
        .toLowerCase()
        .split(/\s+/)
        .filter((word) => word.length >= MIN_WORD_LENGTH);

      if (!trimmed.length) {
        setVariantErrorMessage(`Must have 1 or more terms of at least ${MIN_WORD_LENGTH} characters`);
      } else {
        setVariantErrorMessage('');
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
  }, [variant, threshold]);

  const handleVariantChange = useCallback((event) => {
    const newVariant = event.target.value;

    if (newVariant !== variant) {
      setVariant(newVariant);
    }
  }, [variant]);

  const handleThresholdChange = useCallback((event) => {
    const newThreshold = event.target.value;

    if (newThreshold !== threshold) {
      setThreshold(newThreshold);
    }
  }, [threshold]);

  return (
    <div className="search-view">
      <div className="search-view__bar">
        <div
          className="search-view__main"
          onKeyUp={(event) => event.key === ENTER_KEY && handleSubmit()}
          role="textbox"
          tabIndex={0}
        >
          <TextField
            variant="outlined"
            error={Boolean(variantErrorMessage)}
            fullWidth
            helperText={variantErrorMessage}
            onChange={handleVariantChange}
            placeholder="Search Reports by KB Matches"
            value={variant}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton color="primary" onClick={handleSubmit} disabled={!!variantErrorMessage || !!thresholdErrorMessage} type="submit">
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
          The matching threshold determines the cutoff of similarity between the kb variant and its matched results.
          A value of 1 means a 100% match. The default value is 0.8 if not specified.
        </Typography>
      </div>
    </div>
  );
};

export default SearchByKbmatchView;
