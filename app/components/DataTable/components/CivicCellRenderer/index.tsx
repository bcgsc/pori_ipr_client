import React, { useState, useEffect } from 'react';

import NewTabLink from '@/components/NewTabLink';
// eslint-disable-next-line import/no-extraneous-dependencies
import { ICellRendererParams } from '@ag-grid-community/core';
import {
  Menu, MenuItem,
} from '@mui/material';

type CivicCellRendererProps = ICellRendererParams['data'];

const CivicCellRenderer = ({
  data,
}: CivicCellRendererProps): JSX.Element => {
  const {
    externalStatementId,
    externalSource,
  } = data;

  const [link, setLink] = useState('');
  const [links, setLinks] = useState<string[]>([]);
  const [text, setText] = useState('');
  const [anchorEl, setAnchorEl] = useState<Element>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  useEffect(() => {
    if (data) {
      if (Array.isArray(externalSource)) {
        const numOnly = /^\d+$/;
        if (externalSource.map((es) => es.toLowerCase()).includes('civic')) {
          // TODO: Assume all numeric for now that it is civic ids, more types of external sources to come
          setLinks(externalStatementId.filter((id) => numOnly.test(id)));
          setText(externalSource.filter((src) => src?.toLowerCase() !== 'civic').join(', '));
        } else {
          setText(externalSource.join(', '));
        }
      } else {
        const intId = parseInt(externalStatementId, 10);
        if (
          externalSource?.toLowerCase() === 'civic'
          && !Number.isNaN(intId)
        ) {
          if (Array.isArray(externalStatementId)) {
            setLinks(externalStatementId);
          } else {
            setLink(`https://civicdb.org/links/evidence/${intId}`);
            setText(externalSource);
          }
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
        <span>{text ? `${text},` : '' }</span>
        <button
          type="button"
          style={{
            backgroundColor: 'unset',
            border: 'none',
          }}
          aria-label="Open in CIViC"
          title="Open in CIViC"
          className="new-tab-link"
          onClick={handleMenuOpen}
        >
          CIViC
        </button>
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
export { CivicCellRendererProps };
