import './index.scss';

import {
  Typography,
} from '@material-ui/core';
import React from 'react';

import sectionData from './sectionData';

const Terms = () => {
  const sections = [];

  sectionData.forEach((sectionDatum) => {
    const section = (
      <div key={sectionDatum.id}>
        <Typography id={sectionDatum.id} variant="h5">
          {sectionDatum.label}
        </Typography>
        <Typography paragraph>
          {sectionDatum.content}
        </Typography>
      </div>
    );
    sections.push(section);
  });

  return (
    <div className="about-page">
      <div className="about-page__content">
        <Typography variant="h4">
              IPR Terms of Use
        </Typography>
        {sections}
      </div>
    </div>
  );
};

export default Terms;
