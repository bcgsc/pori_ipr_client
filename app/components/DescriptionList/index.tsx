import React, { useState, useEffect } from 'react';
import {
  List,
  ListItem,
  ListItemText,
  IconButton,
  Divider,
} from '@mui/material';
import LaunchIcon from '@mui/icons-material/Launch';

import './index.scss';

type DescriptionListProps = {
  entries: Record<string, unknown>[],
};

/**
 * Displays term/value pairs in 2 columns
 *
 * @param {array} props.entries
 */
const DescriptionList = ({
  entries,
}: DescriptionListProps): JSX.Element => {
  const [visibleEntries, setVisibleEntries] = useState([]);

  useEffect(() => {
    if (entries && entries.length) {
      setVisibleEntries(entries.filter(({ value }) => value !== null && value !== ''));
    }
  }, [entries]);

  if (!visibleEntries.length) {
    return null;
  }

  return (

    <List className="description-list">
      {visibleEntries.map(({ term, value, action }, index) => (
        <React.Fragment key={term}>
          <ListItem className="description-list__group">
            <span className="description-list__text-group">
              <ListItemText className="description-list__term">
                {`${term}: `}
              </ListItemText>
              <ListItemText className="description-list__value">
                {value}
                {action && (
                <IconButton size="small" onClick={action} className="description-list__action">
                  <LaunchIcon />
                </IconButton>
                )}
              </ListItemText>
            </span>
          </ListItem>
          {index % 2 === 1 && index !== visibleEntries.length - 1 && (
          <Divider variant="middle" className="description-list__divider" />
          )}
        </React.Fragment>
      ))}
    </List>

  );
};

export default DescriptionList;
