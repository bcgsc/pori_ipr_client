import React, { useState, useContext, useCallback } from 'react';
import {
  AppBar,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import PersonIcon from '@mui/icons-material/Person';
import { logout } from '@/services/management/auth';
import useSecurity from '@/hooks/useSecurity';
import SidebarContext from '@/context/SidebarContext';
import FeedbackDialog from './components/FeedbackDialog';
import UserSettingsDialog from './components/UserSettingsDialog';

import './index.scss';

const NavBar = (): JSX.Element => {
  const { userDetails } = useSecurity();
  const { sidebarMaximized, setSidebarMaximized } = useContext(SidebarContext);

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>();
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);
  const [showUserSettingsDialog, setShowUserSettingsDialog] = useState(false);

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

  const handleUserSettingsClick = () => {
    handleCloseMenu();
    setShowUserSettingsDialog(true);
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
            size="large"
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
            open={Boolean(anchorEl)}
            onClose={handleCloseMenu}
          >
            <MenuItem onClick={handleUserSettingsClick}>User Profile</MenuItem>
            <MenuItem onClick={handleFeedbackClick}>Feedback</MenuItem>
            <MenuItem onClick={logout}>Logout</MenuItem>
          </Menu>
          <UserSettingsDialog
            editData={userDetails}
            isOpen={showUserSettingsDialog}
            onClose={() => setShowUserSettingsDialog(false)}
          />
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
