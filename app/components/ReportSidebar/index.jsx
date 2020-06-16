import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Typography } from '@material-ui/core';

import './index.scss';

const ReportSidebar = (props) => {
  const {
    sections,
  } = props;

  return (
    <div className="report-sidebar">
      <ul className="report-sidebar__list">
        <li className="report-sidebar__list-title">
          Report Sections
        </li>
        {sections.map(section => (
          <React.Fragment key={section.name}>
            {section.uri ? (
              <Link to={{ pathname: section.uri }} className="report-sidebar__list-link">
                <li className="report-sidebar__list-item">
                  <Typography variant="body2">
                    {section.name}
                  </Typography>
                </li>
              </Link>
            ) : (
              <li className="report-sidebar__list-item report-sidebar__list-item--bold">
                <Typography variant="h6">
                  {section.name}
                </Typography>
              </li>
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
                      <li className="report-sidebar__list-item--indented">
                        <Typography variant="body2">
                          {child.name}
                        </Typography>
                      </li>
                    </Link>
                  ))}
                </>
              ) : null}
            </>
          </React.Fragment>
        ))}
      </ul>
    </div>
  );
};

ReportSidebar.propTypes = {
  sections: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default ReportSidebar;
