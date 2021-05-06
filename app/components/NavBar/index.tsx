import React, { useState, useCallback } from 'react';
import {
  AppBar,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
} from '@material-ui/core';
import MenuIcon from '@material-ui/icons/Menu';
import PersonIcon from '@material-ui/icons/Person';

import FeedbackDialog from './components/FeedbackDialog';

import './index.scss';

const NavBar = () => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>();
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);

  const handleOpenMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleFeedbackClick = () => {
    handleCloseMenu();
    setShowFeedbackDialog(true);
  };

  return (
    <AppBar>
      <Toolbar className="navbar" variant="dense">
        <div className="navbar__left">
          <IconButton edge="start">
            <MenuIcon style={{ color: 'white' }} />
          </IconButton>
          <Typography display="inline" variant="h3">Integrated Pipeline Reports</Typography>
          <Typography display="inline" variant="caption">v6.0.2</Typography>
        </div>
        <Button
          onClick={handleOpenMenu}
          style={{ color: 'white' }}
        >
          <PersonIcon />
          Anna Davies
        </Button>
        <Menu
          anchorEl={anchorEl}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
          }}
          getContentAnchorEl={null}
          open={Boolean(anchorEl)}
          onClose={handleCloseMenu}
        >
          <MenuItem onClick={handleFeedbackClick}>Feedback</MenuItem>
          <MenuItem>Logout</MenuItem>
        </Menu>
        <FeedbackDialog
          isOpen={showFeedbackDialog}
          onClose={() => setShowFeedbackDialog(false)}
        />
      </Toolbar>
    </AppBar>
  );
};

export default NavBar;
