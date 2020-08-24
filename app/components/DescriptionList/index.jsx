import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  List,
  ListItem,
  ListItemText,
  IconButton,
} from '@material-ui/core';
import EditIcon from '@material-ui/icons/Edit';

import './index.scss';

/**
 * Displays term/value pairs in 2 columns
 * 
 * @param {object} props 
 * @param {array} props.entries
 */
const DescriptionList = (props) => {
  const {
    entries,
  } = props;

  const [visibleEntries, setVisibleEntries] = useState();

  useEffect(() => {
    if (entries && entries.length) {
      setVisibleEntries(entries.filter(({ value }) => value !== null && value !== ''));
    }
  }, [entries]);

  return (
    <>
      {visibleEntries && (
        <List className="description-list">
          {visibleEntries.map(({ term, value, action }) => (
            <ListItem key={term} className="description-list__group">
              <span className="description-list__text-group">
                <ListItemText className="description-list__term">
                  {`${term}: `}
                </ListItemText>
                <ListItemText className="description-list__value">
                  {value}
                  {action && (
                    <IconButton size="small" onClick={action} className="description-list__action">
                      <EditIcon />
                    </IconButton>
                  )}
                </ListItemText>
              </span>
            </ListItem>
          ))}
        </List>
      )}
    </>
  );
};

DescriptionList.propTypes = {
  entries: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default DescriptionList;
