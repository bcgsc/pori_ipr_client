import React from 'react';

import './index.scss';

type NewTabLinkProps = {
  link: string;
  text: string;
};

const NewTabLink = ({
  link,
  text,
}: NewTabLinkProps): JSX.Element => (
  <a className="new-tab-link" href={link} target="_blank" rel="noopener noreferrer">
    {text}
  </a>
);

export default NewTabLink;
