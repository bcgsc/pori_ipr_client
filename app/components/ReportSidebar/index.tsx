import React, { useCallback, useContext, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  IconButton,
  List, ListItem, ListItemText, Menu, MenuItem, Typography,
} from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import ReportContext from '@/context/ReportContext';

import './index.scss';

type SectionType = {
  name: string;
  uri: string;
  meta: boolean;
  showChildren: boolean;
  clinician: boolean;
  children: SectionType[];
};

type ReportSidebarProps = {
  allSections: SectionType[];
  visibleSections: string[];
  isSidebarVisible: boolean;
};

const ReportSidebar = (props: ReportSidebarProps) => {
  const {
    allSections,
    visibleSections,
    isSidebarVisible,
  } = props;
  const { pathname } = useLocation();
  const { report } = useContext(ReportContext);
  const [anchorEl, setAnchorEl] = useState(null);

  const showAllPrintOptions = (report?.template?.name !== 'rapid' && report?.template?.name !== 'genomic');

  const handlePrintMenuOpen = useCallback((event) => {
    if (!showAllPrintOptions) {
      window.open(`/condensedLayoutPrint/${report.ident}`, '_blank', 'noopener,noreferrer');
    } else {
      setAnchorEl(event.currentTarget);
    }
  }, [showAllPrintOptions, report.ident]);

  const handlePrintMenuClose = () => {
    setAnchorEl(null);
  };

  if (!isSidebarVisible) {
    return null;
  }

  return (
    <div className="report-sidebar">
      <List dense classes={{ root: 'report-sidebar__list' }}>
        <ListItem classes={{ root: 'report-sidebar__list-item report-sidebar__list-item--no-hover' }}>
          <ListItemText classes={{ root: 'report-sidebar__list-title', primary: 'report-sidebar__list-title-text' }}>
            Report Sections
          </ListItemText>
          <IconButton onClick={handlePrintMenuOpen}>
            <PrintIcon />
          </IconButton>
          {showAllPrintOptions && (
            <Menu
              anchorEl={anchorEl}
              keepMounted
              open={Boolean(anchorEl)}
              onClose={handlePrintMenuClose}
            >
              <MenuItem>
                <Link
                  to={{ pathname: `/condensedLayoutPrint/${report.ident}` }}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="report-sidebar__list-link"
                >
                  <Typography>Condensed Layout</Typography>
                </Link>
              </MenuItem>
              <MenuItem>
                <Link
                  to={{ pathname: `/print/${report.ident}` }}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="report-sidebar__list-link"
                >
                  <Typography>Standard Layout</Typography>
                </Link>
              </MenuItem>
            </Menu>
          )}
        </ListItem>
        {allSections.map((section) => (
          <React.Fragment key={section.name}>
            {((section.uri && visibleSections.includes(section.uri)) || (section.uri === 'summary' && visibleSections.some((element) => element.startsWith('summary')))) && (
              <Link to={({ pathname: pn }) => `${pn.replace(/\/[^/]*$/, '')}/${section.uri}`} className="report-sidebar__list-link">
                <ListItem classes={{
                  root: `
                    report-sidebar__list-item
                    ${pathname.split('/').pop() === section.uri ? 'report-sidebar__list-item--active' : ''}
                  `,
                }}
                >
                  <ListItemText>
                    {section.name}
                  </ListItemText>
                </ListItem>
              </Link>
            )}
            {section.children.some((child) => visibleSections.includes(child.uri)) && (
              <ListItem classes={{ root: 'report-sidebar__list-item report-sidebar__list-item--no-hover' }}>
                <ListItemText classes={{ primary: 'report-sidebar__list-item-text--bold' }}>
                  {section.name}
                </ListItemText>
              </ListItem>
            )}
            {Boolean(section.children.length) && (
              section.children.map((child) => (
                <React.Fragment key={child.uri}>
                  {visibleSections.includes(child.uri) && (
                    <Link
                      key={child.uri}
                      to={({ pathname: pn }) => `${pn.replace(/\/[^/]*$/, '')}/${child.uri}`}
                      className="report-sidebar__list-link"
                    >
                      <ListItem classes={{
                        root: `
                        report-sidebar__list-item--indented
                        ${pathname.split('/').pop() === child.uri ? 'report-sidebar__list-item--active' : ''}
                      `,
                      }}
                      >
                        <ListItemText>
                          {child.name}
                        </ListItemText>
                      </ListItem>
                    </Link>
                  )}
                </React.Fragment>
              ))
            )}
          </React.Fragment>
        ))}
        <Link to={{ pathname: 'settings' }} className="report-sidebar__list-link">
          <ListItem classes={{
            root: `
                report-sidebar__list-item
                ${pathname.split('/').pop() === 'settings' ? 'report-sidebar__list-item--active' : ''}
              `,
          }}
          >
            <ListItemText>
              Settings
            </ListItemText>
          </ListItem>
        </Link>
      </List>
    </div>
  );
};

export default ReportSidebar;
