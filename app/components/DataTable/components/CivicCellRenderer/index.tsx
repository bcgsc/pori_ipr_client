import React, { useState, useEffect } from 'react';

import NewTabLink from '@/components/NewTabLink';
// eslint-disable-next-line import/no-extraneous-dependencies
import { ICellRendererParams } from '@ag-grid-community/core';
import { IconButton, Menu, MenuItem } from '@material-ui/core';
import { OpenInNew } from '@material-ui/icons';

type CivicCellRendererProps = ICellRendererParams['data'];

const CivicCellRenderer = ({
  data,
}: CivicCellRendererProps): JSX.Element => {
  const {
    externalStatementId,
    externalSource,
  } = data;

  const [link, setLink] = useState('');
  const [links, setLinks] = useState([]);
  const [text, setText] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  useEffect(() => {
    if (data) {
      if (Array.isArray(externalSource)) {
        const numOnly = /^\d+$/;
        if (externalSource.map((es) => es.toLowerCase()).includes('civic')) {
          setLinks(externalStatementId.filter((id) => numOnly.test(id)));
          setText(externalSource.filter((src) => src?.toLowerCase() !== 'civic').join(','));
        } else {
          setText(externalSource.join(','));
        }
      } else {
        const intId = parseInt(externalStatementId, 10);
        if (
          externalSource?.toLowerCase() === 'civic'
          && !Number.isNaN(intId)
        ) {
          setLink(`https://civicdb.org/links/evidence/${intId}`);
          setText(externalSource);
        } else {
          setText(externalSource);
        }
      }
    }
  }, [data, externalStatementId, externalSource]);

  const menuItems = links.map((linkId) => (
    <MenuItem
      key={linkId}
      onClick={handleMenuClose}
    >
      <NewTabLink link={`https://civicdb.org/links/evidence/${linkId}`} text={linkId} />
    </MenuItem>
  ));

  if (links.length > 1) {
    return (
      <>
        <span>{text}</span>
        <IconButton
          size="small"
          aria-label="Open in CIViC"
          title="Open in CIViC"
          onClick={handleMenuOpen}
        >
          <OpenInNew />
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          {menuItems}
        </Menu>
      </>
    );
  }

  if (link) {
    return <NewTabLink link={link} text={text} />;
  }
  return <div>{text}</div>;
};

export default CivicCellRenderer;
