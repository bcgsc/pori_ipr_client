import React, { useState, useContext, useCallback } from 'react';
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

import { logout } from '@/services/management/auth';
import SecurityContext from '@/components/SecurityContext';
import SidebarContext from '@/components/SidebarContext';
import FeedbackDialog from './components/FeedbackDialog';

import './index.scss';

const NavBar = (): JSX.Element => {
  const { userDetails } = useContext(SecurityContext);
  const { sidebarMaximized, setSidebarMaximized } = useContext(SidebarContext);

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

  const handleExpandSidebar = useCallback(() => {
    setSidebarMaximized(!sidebarMaximized);
  }, [setSidebarMaximized, sidebarMaximized]);

  return (
    <AppBar className={`appbar ${sidebarMaximized ? 'appbar--minimized' : ''}`}>
      <Toolbar className="navbar" variant="dense">
        <div className="navbar__left">
          <IconButton
            className="navbar__button"
            edge="start"
            onClick={handleExpandSidebar}
          >
            <MenuIcon />
          </IconButton>
          <Typography
            className="navbar__text"
            display="inline"
            variant="h3"
          >
            Integrated Pipeline Reports
          </Typography>
          <Typography
            className="navbar__text"
            display="inline"
            style={{ padding: '6px 0 0' }}
            variant="caption"
          >
            {`v${VERSION}`}
          </Typography>
        </div>
        <div className="navbar__right">
          <Button
            className="navbar__button"
            onClick={handleOpenMenu}
          >
            <PersonIcon className="navbar__icon" />
            {`${userDetails.firstName ?? ''} ${userDetails.lastName ?? ''}`}
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
            <MenuItem onClick={logout}>Logout</MenuItem>
          </Menu>
          <FeedbackDialog
            isOpen={showFeedbackDialog}
            onClose={() => setShowFeedbackDialog(false)}
          />
        </div>
      </Toolbar>
    </AppBar>
  );
};

export default NavBar;
