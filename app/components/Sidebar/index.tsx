import React, { useContext, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Drawer,
  Divider,
  Hidden,
  IconButton,
  List,
  ListItem,
  Typography,
  Link as MuiLink,
} from '@material-ui/core';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import AssignmentIcon from '@material-ui/icons/Assignment';
import MenuBookIcon from '@material-ui/icons/MenuBook';
import HelpOutlineIcon from '@material-ui/icons/HelpOutline';
import PersonIcon from '@material-ui/icons/Person';
import PeopleIcon from '@material-ui/icons/People';
import FolderSharedIcon from '@material-ui/icons/FolderShared';
import DashboardIcon from '@material-ui/icons/Dashboard';

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
        <IconButton onClick={handleSidebarClose}>
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
            <Link className="sidebar__link" to="/reports">
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
          className={`
            sidebar__list-item
            ${pathname.includes('terms') ? 'sidebar__list-item--active' : ''}
          `}
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
              className={`
                sidebar__list-item
                ${pathname.includes('template') ? 'sidebar__list-item--active' : ''}
              `}
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
      <Hidden xsDown>
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
