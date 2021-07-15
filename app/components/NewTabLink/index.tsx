import React from 'react';

type NewTabLinkProps = {
  link: string;
  text: string;
};

const NewTabLink = ({
  link,
  text,
}: NewTabLinkProps): JSX.Element => (
  <a href={link} target="_blank" rel="noopener noreferrer">
    {text}
  </a>
);

export default NewTabLink;
