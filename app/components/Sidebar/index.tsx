import React, {
  useContext, useCallback, useMemo, useState,
} from 'react';
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
  Collapse,
  Box,
} from '@mui/material';
import { SvgIconComponent } from '@mui/icons-material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import HomeIcon from '@mui/icons-material/Home';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AssignmentInd from '@mui/icons-material/AssignmentInd';
import ContentPasteSearchIcon from '@mui/icons-material/ContentPasteSearch';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import PersonIcon from '@mui/icons-material/Person';
import PeopleIcon from '@mui/icons-material/People';
import FolderSharedIcon from '@mui/icons-material/FolderShared';
import DashboardIcon from '@mui/icons-material/Dashboard';
import FilePresentIcon from '@mui/icons-material/FilePresent';
import NotesIcon from '@mui/icons-material/Notes';

import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import GermlineIcon from '@/statics/images/germline_icon.svg';
import SidebarContext from '@/context/SidebarContext';
import useResource from '@/hooks/useResource';
import GscLogo from '@/statics/images/gsclogo.svg';

import './index.scss';

type SidebarItemPropTypes = {
  to: string;
  icon: SvgIconComponent;
  label: string;
  isActive: boolean;
  sidebarMaximized: boolean;
};

const SidebarItem = ({
  to, icon: Icon, label, isActive, sidebarMaximized,
}: SidebarItemPropTypes) => (
  <ListItem
    className={`sidebar__list-item ${isActive ? 'sidebar__list-item--active' : ''}`}
    disableGutters
  >
    <Link className="sidebar__link" to={to}>
      <Icon color="action" />
      <Typography
        display="inline"
        className={`sidebar__text ${sidebarMaximized ? 'sidebar__text--visible' : 'sidebar__text--hidden'}`}
      >
        {label}
      </Typography>
    </Link>
  </ListItem>
);

const Sidebar = (): JSX.Element => {
  const { pathname } = useLocation();
  const { sidebarMaximized, setSidebarMaximized } = useContext(SidebarContext);
  const {
    germlineAccess, reportsAccess, managerAccess, adminAccess, templateEditAccess, appendixEditAccess, variantTextEditAccess,
  } = useResource();
  const [open, setOpen] = useState(true);

  const handleSidebarClose = useCallback(() => {
    setSidebarMaximized(false);
  }, [setSidebarMaximized]);

  const showMenuOnLeft = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'), { noSsr: true });

  const nestedReportsSection = useMemo(() => {
    if (!reportsAccess) {
      return null;
    }
    return (
      <>
        <ListItem
          className="sidebar__collapsible"
          onClick={() => setOpen(!open)}
        >
          <HomeIcon color="action" sx={{ scale: '110%' }} />
          <Typography
            display="inline"
            className={`sidebar__collapsing-text ${sidebarMaximized ? 'sidebar__text--visible' : 'sidebar__text--hidden'}`}
          >
            Reports
          </Typography>
          {open ? <ExpandLess className="expand-arrow" /> : <ExpandMore className="expand-arrow" />}
        </ListItem>
        <Collapse in={open} timeout="auto" unmountOnExit>
          <ListItem
            className={`
              sidebar__collapse-item
              ${pathname.includes('report') && !pathname.includes('germline') && !pathname.includes('my') ? 'sidebar__collapse-item--active' : ''}
            `}
            disableGutters
          >
            {sidebarMaximized && (
            <Box sx={{ width: '8px' }} />
            )}
            <Link className="sidebar__link" to="/reports">
              <AssignmentIcon color="action" />
              <Typography
                display="inline"
                className={`sidebar__subtext ${sidebarMaximized ? 'sidebar__subtext--visible' : 'sidebar__subtext--hidden'}`}
                variant="subtitle1"
              >
                All Reports
              </Typography>
            </Link>
          </ListItem>
          <ListItem
            className={`sidebar__collapse-item ${pathname.includes('my') ? 'sidebar__collapse-item--active' : ''}`}
            disableGutters
          >
            {sidebarMaximized && (
            <Box sx={{ width: '8px' }} />
            )}
            <Link className="sidebar__link" to="/my-reports">
              <AssignmentInd color="action" />
              <Typography
                display="inline"
                className={`sidebar__subtext ${sidebarMaximized ? 'sidebar__subtext--visible' : 'sidebar__subtext--hidden'}`}
                variant="subtitle1"
              >
                My Reports
              </Typography>
            </Link>
          </ListItem>
          <ListItem
            className={`sidebar__collapse-item ${pathname.includes('search') && !pathname.includes('kb') ? 'sidebar__collapse-item--active' : ''}`}
            disableGutters
          >
            {sidebarMaximized && (
            <Box sx={{ width: '8px' }} />
            )}
            <Link className="sidebar__link" to="/search">
              <ContentPasteSearchIcon color="action" />
              <Typography
                display="inline"
                className={`sidebar__subtext ${sidebarMaximized ? 'sidebar__subtext--visible' : 'sidebar__subtext--hidden'}`}
                variant="subtitle1"
              >
                Search for Reports
              </Typography>
            </Link>
          </ListItem>
        </Collapse>
      </>
    );
  }, [open, pathname, reportsAccess, sidebarMaximized]);

  const germlineReportsSection = useMemo(() => {
    if (!germlineAccess) {
      return null;
    }
    return (
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
    );
  }, [germlineAccess, pathname, sidebarMaximized]);

  const adminSection = useMemo(() => {
    const adminLinks = [
      {
        to: '/admin/users', icon: PersonIcon, label: 'Users', key: 'users',
      },
      {
        to: '/admin/groups', icon: PeopleIcon, label: 'Groups', key: 'groups',
      },
      {
        to: '/admin/projects', icon: FolderSharedIcon, label: 'Projects', key: 'projects',
      },
      {
        to: '/template', icon: DashboardIcon, label: 'Templates', key: 'template',
      },
      {
        to: '/admin/appendices', icon: FilePresentIcon, label: 'Appendices', key: 'admin/appendices',
      },
      {
        to: '/admin/variant-text', icon: NotesIcon, label: 'Variant Text', key: 'admin/variant-text',
      },
    ];

    const reportLinks = [
      {
        to: '/projects', icon: FolderSharedIcon, label: 'Projects', key: 'projects',
      },
      templateEditAccess && {
        to: '/template', icon: DashboardIcon, label: 'Templates', key: 'template',
      },
      appendixEditAccess && {
        to: '/admin/appendices', icon: FilePresentIcon, label: 'Appendices', key: 'admin/appendices',
      },
      variantTextEditAccess && {
        to: '/variant-text', icon: NotesIcon, label: 'Variant Text', key: 'variant-text',
      },
    ].filter(Boolean);

    if (managerAccess || adminAccess) {
      return (
        <>
          {adminLinks.map(({
            to, icon, label, key,
          }) => (
            <SidebarItem
              key={to}
              to={to}
              icon={icon}
              label={label}
              isActive={pathname.includes(key)}
              sidebarMaximized={sidebarMaximized}
            />
          ))}
        </>
      );
    } if (!managerAccess && reportsAccess) {
      return (
        <>
          {reportLinks.map(({
            to, icon, label, key,
          }) => (
            <SidebarItem
              key={to}
              to={to}
              icon={icon}
              label={label}
              isActive={pathname.includes(key)}
              sidebarMaximized={sidebarMaximized}
            />
          ))}
        </>
      );
    }
    return null;
  }, [templateEditAccess, appendixEditAccess, variantTextEditAccess, managerAccess, adminAccess, reportsAccess, pathname, sidebarMaximized]);

  const drawer = useMemo(
    () => (
      <div>
        <div className="sidebar__minimize">
          <IconButton onClick={handleSidebarClose} size="large">
            <ChevronLeftIcon />
          </IconButton>
        </div>
        <Divider />
        <List disablePadding>
          {nestedReportsSection}
          {germlineReportsSection}
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
        <div className="sidebar__footer">
          <ListItem>
            <GscLogo />
          </ListItem>
        </div>
      </div>
    ),
    [handleSidebarClose, nestedReportsSection, germlineReportsSection, sidebarMaximized, pathname, adminSection],
  );

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
