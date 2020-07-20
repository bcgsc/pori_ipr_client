import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import './index.scss';

const DescriptionList = (props) => {
  const {
    entries,
  } = props;

  const [visibleEntries, setVisibleEntries] = useState();

  useEffect(() => {
    if (entries && entries.length) {
      setVisibleEntries(entries.filter(({ value }) => value !== null));
    }
  }, [entries]);

  return (
    <>
      {visibleEntries && (
        <dl className="description-list">
          {visibleEntries.map(({ term, value }, index) => (
            <span
              key={term}
              className={`
                description-list__group
                ${index < (visibleEntries.length - 1) / 2 ? 'description-list__group--left' : 'description-list__group--right'}
              `}
            >
              <dt className="description-list__term">
                {term}
              </dt>
              <dd className="description-list__value">
                {value}
              </dd>
            </span>
          ))}
        </dl>
      )}
    </>
  );
};

DescriptionList.propTypes = {
  entries: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default DescriptionList;
