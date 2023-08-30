import {
  IconButton, Menu, MenuItem, CircularProgress,
} from '@mui/material';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import React, { useState, useCallback } from 'react';
import api from '@/services/api';
import { KbMatchType } from '@/common';
import { useParams } from 'react-router-dom';
import {
  ActionCellRendererProps,
  ActionCellRenderer,
} from '../ActionCellRenderer';

type TherapeuticTargetType = 'therapeutic' | 'chemoresistance';

const KbMatchesActionCellRenderer = (props: ActionCellRendererProps) => {
  const { ident: reportId } = useParams<{ ident: string }>();
  const { data } = props;
  const {
    context,
    variant: {
      ident: variantId,
    },
  } = data as KbMatchType;
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement>();
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdateTherapeuticTargets = useCallback((type: TherapeuticTargetType) => async () => {
    setIsLoading(true);
    let exists = false;

    try {
      await api.get(`/reports/${reportId}/therapeutic-targets/${variantId}`).request();
      exists = true;
    } catch (e) {
      if (e.status === 404) {
        exists = false;
      } else {
        console.error(e);
      }
    }

    try {
      let call = api.post(`/reports/${reportId}/therapeutic-targets/${variantId}`, {
        type,
        context,
      });

      if (exists) {
        call = api.put(`/reports/${reportId}/therapeutic-targets/${variantId}`, {
          type,
          context,
        });
      }

      const response = await call.request();
      console.log('🚀 ~ file: index.tsx:34 ~ handleUpdateTherapeuticTargets ~ response:', response);
    } catch (error) {
      console.log('🚀 ~ file: index.tsx:36 ~ handleUpdateTherapeuticTargets ~ error:', error);
      // Handle the error here...
    } finally {
      setMenuAnchor(null);
      setIsLoading(false);
    }
  }, [context, reportId, variantId]);

  return (
    <>
      <IconButton
        onClick={(event) => setMenuAnchor(event.currentTarget)}
        size="small"
      >
        <MoreHorizIcon />
      </IconButton>
      {
        isLoading ? <CircularProgress /> : (
          <Menu
            anchorEl={menuAnchor}
            open={Boolean(menuAnchor)}
            onClose={() => setMenuAnchor(null)}
          >
            <MenuItem onClick={handleUpdateTherapeuticTargets('therapeutic')}>
              Add to Potential Therapeutic Targets
            </MenuItem>
            <MenuItem onClick={handleUpdateTherapeuticTargets('chemoresistance')}>
              Add to Potential Chemoresistance
            </MenuItem>
            <ActionCellRenderer displayMode="menu" {...props} />
          </Menu>
        )
      }
    </>
  );
};

export default KbMatchesActionCellRenderer;
