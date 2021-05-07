import React, { useContext, useState, useCallback } from 'react';
import {
  Drawer,
  Divider,
  Hidden,
  IconButton,
  Link,
  List,
  ListItem,
} from '@material-ui/core';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import AssignmentIcon from '@material-ui/icons/Assignment';

import SidebarContext from '../SidebarContext';

import './index.scss';

const Sidebar = (): JSX.Element => {
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
      <List>
        <ListItem>
          <Link href="/reports">
            <AssignmentIcon color="action" />
            {sidebarMaximized && (
              <>
                Reports
              </>
            )}
          </Link>
        </ListItem>
        <ListItem>
          <Link href="/reports">
            <AssignmentIcon color="action" />
            {sidebarMaximized && (
              <>
                Reports
              </>
            )}
          </Link>
        </ListItem>
        <ListItem>
          <Link href="/reports">
            <AssignmentIcon color="action" />
            {sidebarMaximized && (
              <>
                Reports
              </>
            )}
          </Link>
        </ListItem>
        <ListItem>
          <Link href="/reports">
            <AssignmentIcon color="action" />
            {sidebarMaximized && (
              <>
                Reports
              </>
            )}
          </Link>
        </ListItem>
        <Divider />
        <ListItem>
          <Link href="/reports">
            <AssignmentIcon color="action" />
            {sidebarMaximized && (
              <>
                Reports
              </>
            )}
          </Link>
        </ListItem>
        <ListItem>
          <Link href="/reports">
            <AssignmentIcon color="action" />
            {sidebarMaximized && (
              <>
                Reports
              </>
            )}
          </Link>
        </ListItem>
        <ListItem>
          <Link href="/reports">
            <AssignmentIcon color="action" />
            {sidebarMaximized && (
              <>
                Reports
              </>
            )}
          </Link>
        </ListItem>
      </List>
    </div>
  );

  return (
    <nav>
      <Hidden smUp>
        <Drawer
          classes={{ paper: `sidebar__paper ${sidebarMaximized ? 'sidebar__paper--maximized' : ''}` }}
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
