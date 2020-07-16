import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import {
  List, ListItem, ListItemText,
} from '@material-ui/core';

import './index.scss';

const ReportSidebar = (props) => {
  const {
    sections,
    isSidebarVisible,
  } = props;

  if (!isSidebarVisible) {
    return null;
  }

  return (
    <div className="report-sidebar">
      <List dense classes={{ root: 'report-sidebar__list' }}>
        <ListItem classes={{ root: 'report-sidebar__list-item' }}>
          <ListItemText classes={{ root: 'report-sidebar__list-title', primary: 'report-sidebar__list-title-text' }}>
            Report Sections
          </ListItemText>
        </ListItem>
        {sections.map(section => (
          <React.Fragment key={section.name}>
            {section.uri ? (
              <Link to={{ pathname: section.uri }} className="report-sidebar__list-link">
                <ListItem classes={{ root: 'report-sidebar__list-item' }}>
                  <ListItemText>
                    {section.name}
                  </ListItemText>
                </ListItem>
              </Link>
            ) : (
              <ListItem classes={{ root: 'report-sidebar__list-item' }}>
                <ListItemText classes={{ primary: 'report-sidebar__list-item-text--bold' }}>
                  {section.name}
                </ListItemText>
              </ListItem>
            )}
            <>
              {section.children.length ? (
                <>
                  {section.children.map(child => (
                    <Link
                      key={child.uri}
                      to={{ pathname: child.uri }}
                      className="report-sidebar__list-link"
                    >
                      <ListItem classes={{ root: 'report-sidebar__list-item--indented' }}>
                        <ListItemText>
                          {child.name}
                        </ListItemText>
                      </ListItem>
                    </Link>
                  ))}
                </>
              ) : null}
            </>
          </React.Fragment>
        ))}
      </List>
    </div>
  );
};

ReportSidebar.propTypes = {
  sections: PropTypes.arrayOf(PropTypes.object).isRequired,
  isSidebarVisible: PropTypes.bool.isRequired,
};

export default ReportSidebar;
