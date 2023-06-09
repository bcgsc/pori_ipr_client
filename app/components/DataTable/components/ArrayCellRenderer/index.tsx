import React, { useState, useCallback } from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import { ICellRendererParams } from '@ag-grid-community/core';
import {
  Button, List, Popover, ListItem,
} from '@mui/material';
import { MoreHoriz } from '@mui/icons-material';
import './index.scss';

const urlRegex = /^(?:https?:\/\/)?(?:[\w-]+\.)+[a-z]{2,}(?:\/[\w\-\.\/]*)*$/i;

const RenderArrayCell = (field: string, isLink: boolean): (cellParams: ICellRendererParams) => JSX.Element => {
  if (isLink) {
    return function ArrayCell({ data }: ICellRendererParams) {
      const [anchorEl, setAnchorEl] = useState(null);
      const [isOpen, setIsOpen] = useState(false);
      const handleClose = () => {
        setIsOpen(false);
      };
      const handleClick = useCallback((event) => {
        setAnchorEl(event.currentTarget);
        setIsOpen(true);
      }, []);

      if (Array.isArray(data[field]) && data[field].length > 0) {
        // Sort by PMID first
        const cellData: string[] = [...data[field]];

        // Finds all pmid and # strings, removes them, and converts to integer, then sorts by lowest PMID first
        const pmidArray = cellData.filter((item) => item.match(/(pmid:)|(#)/)).map((pmid) => {
          const possibleNum = parseInt(pmid.replace(/(pmid:)|(#)/, ''), 10);
          if (Number.isNaN(possibleNum)) {
            return pmid;
          }
          return possibleNum;
        }).sort();
        const nonPmidArray = cellData.filter((item) => !item.match(/(pmid:)|(#)/));

        const linksComponent = pmidArray.map((pmid) => {
          let link = null;
          let isValidLink = false;
          if ((/^\d+$/).test(String(pmid))) {
            link = `https://ncbi.nlm.nih.gov/pubmed/${pmid}`;
            isValidLink = true;
          } else if (urlRegex.test(String(pmid))) {
            link = pmid;
            isValidLink = true;
          }

          if (isValidLink) {
            return (
              <a
                className="array-cell__link"
                href={link}
                rel="noopener noreferrer"
                target="_blank"
              >
                {pmid}
              </a>
            );
          }
          return <span>{pmid}</span>;
        }).concat(nonPmidArray.map((nonPmid) => <span>{nonPmid}</span>));

        if (linksComponent.length > 1) {
          return (
            <>
              <Button endIcon={MoreHoriz} sx={{ padding: 0 }} onClick={handleClick}>Multiple</Button>
              <Popover
                open={isOpen}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'center',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'center',
                }}
              >
                <List>{linksComponent.map((c) => <ListItem>{c}</ListItem>)}</List>
              </Popover>
            </>
          );
        }
        if (linksComponent.length === 1 && pmidArray.length === 1) {
          return linksComponent[0];
        }
        return <div>{linksComponent}</div>;
      }

      return (
        <div>
          {data[field]}
        </div>
      );
    };
  }

  return function ArrayCell({ data }: ICellRendererParams) {
    if (Array.isArray(data[field])) {
      const cellData = [...data[field]].sort();
      const [firstVal] = cellData;

      if (typeof firstVal === 'string') {
        cellData[0].replace(/#$/, '');
      }

      return (
        <div>
          {`${firstVal === null ? '' : firstVal}`}
          {cellData.length > 1 && (
            <>
              …
            </>
          )}
        </div>
      );
    }
    return (
      <div>
        {`${data[field] === null ? '' : data[field]}`}
      </div>
    );
  };
};

export default RenderArrayCell;
