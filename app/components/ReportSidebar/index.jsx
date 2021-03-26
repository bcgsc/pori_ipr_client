import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { Link, useLocation } from 'react-router-dom';
import {
  List, ListItem, ListItemText,
} from '@material-ui/core';
import PrintIcon from '@material-ui/icons/Print';

import ReportContext from '@/components/ReportContext';

import './index.scss';

const ReportSidebar = (props) => {
  const {
    allSections,
    visibleSections,
    isSidebarVisible,
    canEdit,
  } = props;

  const { pathname } = useLocation();
  const { report } = useContext(ReportContext);

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
          <Link
            to={{ pathname: `/print/${report.ident}` }}
            target="_blank"
            rel="noopener noreferrer"
            className="report-sidebar__list-link report-sidebar__list-link--adornment"
          >
            <PrintIcon />
          </Link>
        </ListItem>
        {allSections.map((section) => (
          <React.Fragment key={section.name}>
            {section.uri && (
              <>
                {visibleSections.includes(section.uri) && (
                  <Link to={{ pathname: section.uri }} className="report-sidebar__list-link">
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
              </>
            )}
            {section.children.some((child) => visibleSections.includes(child.uri)) && (
              <ListItem classes={{ root: 'report-sidebar__list-item report-sidebar__list-item--no-hover' }}>
                <ListItemText classes={{ primary: 'report-sidebar__list-item-text--bold' }}>
                  {section.name}
                </ListItemText>
              </ListItem>
            )}
            <>
              {Boolean(section.children.length) && (
                <>
                  {section.children.map((child) => (
                    <React.Fragment key={child.uri}>
                      {visibleSections.includes(child.uri) && (
                        <Link
                          key={child.uri}
                          to={{ pathname: child.uri }}
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
                  ))}
                </>
              )}
            </>
          </React.Fragment>
        ))}
        {canEdit && (
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
        )}
      </List>
    </div>
  );
};

ReportSidebar.propTypes = {
  allSections: PropTypes.arrayOf(PropTypes.object).isRequired,
  visibleSections: PropTypes.arrayOf(PropTypes.string).isRequired,
  isSidebarVisible: PropTypes.bool.isRequired,
  canEdit: PropTypes.bool.isRequired,
};

export default ReportSidebar;
