import './index.scss';

import {
  TextField,
  Typography,
  Button,
  Dialog,
  InputAdornment,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import HelpIcon from '@mui/icons-material/Help';
import React, { useCallback, useEffect, useState } from 'react';
import { borderRadius } from '@mui/system';

const MIN_WORD_LENGTH = 3;

type SearchHelpDialogProps = {
  open: boolean;
  onClose: () => void;
}

const SearchHelpDialog = ({open, onClose}: SearchHelpDialogProps) => {
  const handleClose = () => {
    onClose();
  }

  return (
    <Dialog onClose={handleClose} open={open}>
      <div className="help-dialog">
        <Typography variant="subtitle2">
          The matching threshold determines the cutoff of similarity between the key variant and the search results.
          A value of 1 means a 100% exact match and vice versa. The default value is 0.8 if not specified.
        </Typography>
      </div>
    </Dialog>
  );
}

const SearchView = () => {
  const [variant, setVariant] = useState('');
  const [threshold, setThreshold] = useState('');
  const [variantErrorMessage, setVariantErrorMessage] = useState('');
  const [thresholdErrorMessage, setThresholdErrorMessage] = useState('');
  const [helpDialogOpen, setHelpDialogOpen] = useState(false);

  // Calls submit function
  const handleSubmit = useCallback(() => {
    if (variant && threshold) {
      window.location.href = `/search/keyVariant=${variant.replace(/\./, '%2F')}&&matchingThreshold=${threshold.replace(/\./, '%2F')}`;
    } else if (variant) {
      window.location.href = `/search/keyVariant=${variant.replace(/\./, '%2F')}&&matchingThreshold=0%2F8`;
    } else {
      setVariantErrorMessage('Please enter a key variant');
    }
  }, [variant, threshold]);

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

  const handleHelpDialogOpen = () => {
    setHelpDialogOpen(true);
  }

  const handleHelpDialogClose = () => {
    setHelpDialogOpen(false);
  }

  return (
    <div className="search">
      <div className="search__bar">
        <div
          className="search__main"
          role="textbox"
          tabIndex={0}
        >
          <TextField
            variant="outlined"
            error={Boolean(variantErrorMessage)}
            fullWidth
            helperText={variantErrorMessage}
            onChange={handleVariantChange}
            placeholder="Search Reports by Key Variant"
            value={variant}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              sx: {borderRadius: '15px'}
            }}
          />
        </div>
        <div className="search__threshold-input">
          <div className="search__threshold-input__label">
            <Typography variant="subtitle1" sx={{width: "fit-content"}}>Threshold</Typography>
            <Button onClick={handleHelpDialogOpen} className="help-button">
              <HelpIcon/>
            </Button>
            <SearchHelpDialog 
              open={helpDialogOpen}
              onClose={handleHelpDialogClose}
            />
          </div>
          <TextField
            size="small"
            variant="outlined"
            helperText={thresholdErrorMessage}
            error={Boolean(thresholdErrorMessage)}
            placeholder="0 - 1"
            onChange={handleThresholdChange}
            value={threshold}
          />
        </div>
      </div>
      <div className="__button-container">
        <div className="button-holder">
          <Button
            variant="contained"
            onClick={handleSubmit}
            color="primary"
            disabled={!!variantErrorMessage || !!thresholdErrorMessage}
            size="large"
          >
            Search
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SearchView;
