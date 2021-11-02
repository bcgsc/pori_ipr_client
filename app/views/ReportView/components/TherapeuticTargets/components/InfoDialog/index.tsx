import React, { useState, useEffect } from 'react';
import {
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';

import api from '@/services/api';

import './index.scss';

type InfoDialogProps = {
  isOpen: boolean;
  onClose: () => void;
};

const InfoDialog = ({ isOpen, onClose }: InfoDialogProps): JSX.Element => {
  const [evidenceLevels, setEvidenceLevels] = useState([]);

  useEffect(() => {
    if (isOpen) {
      const getData = async () => {
        const evidenceLevelsResp = await api.get('/graphkb/evidence-levels', {}).request();
        if (evidenceLevelsResp) {
          setEvidenceLevels(evidenceLevelsResp.result);
        }
      };
      getData();
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="sm" fullWidth className="edit-dialog">
      <DialogTitle>
        <Typography variant="h3">
          Evidence Levels
        </Typography>
      </DialogTitle>
      <DialogContent>
        {Boolean(evidenceLevels.length) && (
          <>
            {evidenceLevels.map(({ displayName, description }) => (
              <div key={displayName} className="info__group">
                <Typography variant="h5">
                  {displayName}
                </Typography>
                <Typography variant="body2">
                  {description}
                </Typography>
              </div>
            ))}
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button color="secondary" onClick={onClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default InfoDialog;
