import React, { useContext, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Drawer,
  Divider,
  Hidden,
  IconButton,
  Link,
  List,
  ListItem,
  Typography,
} from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import AssignmentIcon from '@mui/icons-material/Assignment';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import PersonIcon from '@mui/icons-material/Person';
import PeopleIcon from '@mui/icons-material/People';
import FolderSharedIcon from '@mui/icons-material/FolderShared';
import DashboardIcon from '@mui/icons-material/Dashboard';

import GermlineIcon from '@/statics/images/germline_icon.svg';
import SidebarContext from '@/context/SidebarContext';
import useResource from '@/hooks/useResource';

import './index.scss';

const Sidebar = (): JSX.Element => {
  const { pathname } = useLocation();
  const { sidebarMaximized, setSidebarMaximized } = useContext(SidebarContext);
  const { germlineAccess, reportAccess, adminAccess } = useResource();

  const handleSidebarClose = useCallback(() => {
    setSidebarMaximized(false);
  }, [setSidebarMaximized]);

  const drawer = (
    <div>
      <div className="sidebar__minimize">
        <IconButton onClick={handleSidebarClose} size="large">
          <ChevronLeftIcon />
        </IconButton>
      </div>
      <Divider />
      <List disablePadding>
        {reportAccess && (
          <ListItem
            className={`
              sidebar__list-item
              ${pathname.includes('report') && !pathname.includes('germline') ? 'sidebar__list-item--active' : ''}
            `}
            disableGutters
          >
            <Link className="sidebar__link" href="/reports">
              <AssignmentIcon color="action" />
              <Typography
                display="inline"
                className={`
                sidebar__text
                ${sidebarMaximized ? 'sidebar__text--visible' : 'sidebar__text--hidden'}
                `}
              >
                Reports
              </Typography>
            </Link>
          </ListItem>
        )}
        {germlineAccess && (
          <ListItem
            className={`
              sidebar__list-item
              ${pathname.includes('germline') ? 'sidebar__list-item--active' : ''}
            `}
            disableGutters
          >
            <Link className="sidebar__link" href="/germline">
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
          <Link
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
          </Link>
        </ListItem>
        <ListItem
          className={`
            sidebar__list-item
            ${pathname.includes('terms') ? 'sidebar__list-item--active' : ''}
          `}
          disableGutters
        >
          <Link className="sidebar__link" href="/terms">
            <HelpOutlineIcon color="action" />
            <Typography
              display="inline"
              className={`sidebar__text ${sidebarMaximized ? 'sidebar__text--visible' : 'sidebar__text--hidden'}`}
            >
              Terms of Use
            </Typography>
          </Link>
        </ListItem>
        {adminAccess && (
          <>
            <Divider />
            <ListItem
              className={`
                sidebar__list-item
                ${pathname.includes('users') ? 'sidebar__list-item--active' : ''}
              `}
              disableGutters
            >
              <Link className="sidebar__link" href="/admin/users">
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
              <Link className="sidebar__link" href="/admin/groups">
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
              <Link className="sidebar__link" href="/admin/projects">
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
              className={`
                sidebar__list-item
                ${pathname.includes('template') ? 'sidebar__list-item--active' : ''}
              `}
              disableGutters
            >
              <Link className="sidebar__link" href="/template">
                <DashboardIcon color="action" />
                <Typography
                  display="inline"
                  className={`sidebar__text ${sidebarMaximized ? 'sidebar__text--visible' : 'sidebar__text--hidden'}`}
                >
                  Templates
                </Typography>
              </Link>
            </ListItem>
          </>
        )}
      </List>
    </div>
  );

  return (
    <nav>
      <Hidden smUp>
        <Drawer
          anchor="left"
          classes={{ paper: `sidebar__paper ${sidebarMaximized ? 'sidebar__paper--maximized' : ''}` }}
          open={sidebarMaximized}
          onClose={() => setSidebarMaximized(false)}
          variant="temporary"
        >
          {drawer}
        </Drawer>
      </Hidden>
      <Hidden smDown>
        <Drawer
          classes={{ paper: `sidebar__paper ${sidebarMaximized ? 'sidebar__paper--maximized' : ''}` }}
          variant="permanent"
        >
          {drawer}
        </Drawer>
      </Hidden>
    </nav>
  );
};

export default Sidebar;
