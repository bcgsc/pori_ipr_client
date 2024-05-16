import React, { useContext, useCallback, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Drawer,
  Divider,
  IconButton,
  List,
  ListItem,
  Typography,
  Link as MuiLink,
  useMediaQuery,
  Theme,
  DrawerProps,
} from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import AssignmentIcon from '@mui/icons-material/Assignment';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import PersonIcon from '@mui/icons-material/Person';
import PeopleIcon from '@mui/icons-material/People';
import FolderSharedIcon from '@mui/icons-material/FolderShared';
import DashboardIcon from '@mui/icons-material/Dashboard';
import FilePresentIcon from '@mui/icons-material/FilePresent';

import GermlineIcon from '@/statics/images/germline_icon.svg';
import SidebarContext from '@/context/SidebarContext';
import useResource from '@/hooks/useResource';

import './index.scss';

const Sidebar = (): JSX.Element => {
  const { pathname } = useLocation();
  const { sidebarMaximized, setSidebarMaximized } = useContext(SidebarContext);
  const { germlineAccess, reportsAccess, managerAccess, adminAccess } = useResource();

  const handleSidebarClose = useCallback(() => {
    setSidebarMaximized(false);
  }, [setSidebarMaximized]);

  const showMenuOnLeft = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'), { noSsr: true });

  const drawer = useMemo(() => {
    let adminSection = null;

    if (managerAccess || adminAccess) {
      adminSection = (
        <>
          <ListItem
            className={`
                sidebar__list-item
                ${pathname.includes('users') ? 'sidebar__list-item--active' : ''}
              `}
            disableGutters
          >
            <Link className="sidebar__link" to="/admin/users">
              <PersonIcon color="action" />
              <Typography
                display="inline"
                className={`sidebar__text ${sidebarMaximized ? 'sidebar__text--visible' : 'sidebar__text--hidden'}`}
              >
                Users
              </Typography>
            </Link>
          </ListItem>
          <ListItem
            className={`
                sidebar__list-item
                ${pathname.includes('groups') ? 'sidebar__list-item--active' : ''}
              `}
            disableGutters
          >
            <Link className="sidebar__link" to="/admin/groups">
              <PeopleIcon color="action" />
              <Typography
                display="inline"
                className={`sidebar__text ${sidebarMaximized ? 'sidebar__text--visible' : 'sidebar__text--hidden'}`}
              >
                Groups
              </Typography>
            </Link>
          </ListItem>
          <ListItem
            className={`
                sidebar__list-item
                ${pathname.includes('projects') ? 'sidebar__list-item--active' : ''}
              `}
            disableGutters
          >
            <Link className="sidebar__link" to="/admin/projects">
              <FolderSharedIcon color="action" />
              <Typography
                display="inline"
                className={`sidebar__text ${sidebarMaximized ? 'sidebar__text--visible' : 'sidebar__text--hidden'}`}
              >
                Projects
              </Typography>
            </Link>
          </ListItem>
          <ListItem
            className={`sidebar__list-item ${pathname.includes('template') ? 'sidebar__list-item--active' : ''}`}
            disableGutters
          >
            <Link className="sidebar__link" to="/template">
              <DashboardIcon color="action" />
              <Typography
                display="inline"
                className={`sidebar__text ${sidebarMaximized ? 'sidebar__text--visible' : 'sidebar__text--hidden'}`}
              >
                Templates
              </Typography>
            </Link>
          </ListItem>
          <ListItem
            className={`
                sidebar__list-item
                ${pathname.includes('admin/appendices') ? 'sidebar__list-item--active' : ''}
              `}
            disableGutters
          >
            <Link className="sidebar__link" to="/admin/appendices">
              <FilePresentIcon color="action" />
              <Typography
                display="inline"
                className={`sidebar__text ${sidebarMaximized ? 'sidebar__text--visible' : 'sidebar__text--hidden'}`}
              >
                Appendices
              </Typography>
            </Link>
          </ListItem>
        </>
      );
    } else if (!managerAccess && reportsAccess) {
      adminSection = (
        <ListItem
          className={`
            sidebar__list-item
            ${pathname.includes('projects') ? 'sidebar__list-item--active' : ''}
          `}
          disableGutters
        >
          <Link className="sidebar__link" to="/projects">
            <FolderSharedIcon color="action" />
            <Typography
              display="inline"
              className={`sidebar__text ${sidebarMaximized ? 'sidebar__text--visible' : 'sidebar__text--hidden'}`}
            >
              Projects
            </Typography>
          </Link>
        </ListItem>
      );
    }

    return (
      <div>
        <div className="sidebar__minimize">
          <IconButton onClick={handleSidebarClose} size="large">
            <ChevronLeftIcon />
          </IconButton>
        </div>
        <Divider />
        <List disablePadding>
          {reportsAccess && (
            <ListItem
              className={`
              sidebar__list-item
              ${pathname.includes('report') && !pathname.includes('germline') ? 'sidebar__list-item--active' : ''}
            `}
              disableGutters
            >
              <Link className="sidebar__link" to="/reports">
                <AssignmentIcon color="action" />
                <Typography
                  display="inline"
                  className={`sidebar__text ${sidebarMaximized ? 'sidebar__text--visible' : 'sidebar__text--hidden'}`}
                >
                  Reports
                </Typography>
              </Link>
            </ListItem>
          )}
          {germlineAccess && (
            <ListItem
              className={`sidebar__list-item ${pathname.includes('germline') ? 'sidebar__list-item--active' : ''}`}
              disableGutters
            >
              <Link className="sidebar__link" to="/germline">
                <GermlineIcon className="sidebar__custom-icon" />
                <Typography
                  display="inline"
                  className={`sidebar__text ${sidebarMaximized ? 'sidebar__text--visible' : 'sidebar__text--hidden'}`}
                >
                  Germline
                </Typography>
              </Link>
            </ListItem>
          )}
          <ListItem
            className="sidebar__list-item"
            disableGutters
          >
            <MuiLink
              className="sidebar__link"
              href={window._env_.GRAPHKB_URL}
              rel="noopener noreferrer"
              target="_blank"
            >
              <MenuBookIcon color="action" />
              <Typography
                display="inline"
                className={`sidebar__text ${sidebarMaximized ? 'sidebar__text--visible' : 'sidebar__text--hidden'}`}
              >
                Graph Knowledgebase
              </Typography>
            </MuiLink>
          </ListItem>
          <ListItem
            className={`sidebar__list-item ${pathname.includes('terms') ? 'sidebar__list-item--active' : ''}`}
            disableGutters
          >
            <Link className="sidebar__link" to="/terms">
              <HelpOutlineIcon color="action" />
              <Typography
                display="inline"
                className={`sidebar__text ${sidebarMaximized ? 'sidebar__text--visible' : 'sidebar__text--hidden'}`}
              >
                Terms of Use
              </Typography>
            </Link>
          </ListItem>
          <Divider />
          {adminSection}
        </List>
      </div>
    );
  }, [adminAccess, managerAccess, germlineAccess, handleSidebarClose, pathname, reportsAccess, sidebarMaximized]);

  let drawerProps: DrawerProps = {
    variant: 'temporary',
    anchor: 'left',
    open: sidebarMaximized,
    onClose: () => setSidebarMaximized(false),
  };

  if (showMenuOnLeft) {
    drawerProps = {
      variant: 'permanent',
    };
  }

  return (
    <nav>
      <Drawer
        {...drawerProps}
        classes={{ paper: `sidebar__paper ${sidebarMaximized ? 'sidebar__paper--maximized' : ''}` }}
      >
        {drawer}
      </Drawer>
    </nav>
  );
};

export default Sidebar;
