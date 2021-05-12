import React, { useContext, useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Drawer,
  Divider,
  Hidden,
  IconButton,
  Link,
  List,
  ListItem,
  SvgIcon,
  Typography,
} from '@material-ui/core';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import AssignmentIcon from '@material-ui/icons/Assignment';
import MenuBookIcon from '@material-ui/icons/MenuBook';
import HelpOutlineIcon from '@material-ui/icons/HelpOutline';
import PersonIcon from '@material-ui/icons/Person';
import PeopleIcon from '@material-ui/icons/People';
import FolderSharedIcon from '@material-ui/icons/FolderShared';
import DashboardIcon from '@material-ui/icons/Dashboard';

import GermlineIcon from '@/../statics/images/germline_icon.svg';
import SidebarContext from '../SidebarContext';

import './index.scss';

const Sidebar = (): JSX.Element => {
  const { pathname } = useLocation();
  const { sidebarMaximized, setSidebarMaximized } = useContext(SidebarContext);

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
            ${pathname.includes('templates') ? 'sidebar__list-item--active' : ''}
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
