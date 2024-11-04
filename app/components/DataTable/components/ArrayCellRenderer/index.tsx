import React from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import { ICellRendererParams } from '@ag-grid-community/core';

import './index.scss';

const urlRegex = /^(?:https?:\/\/)?(?:[\w-]+\.)+[a-z]{2,}(?:\/[\w\-\.\/]*)*$/i;

const RenderArrayCell = (field: string, isLink: boolean): (cellParams: ICellRendererParams) => JSX.Element => {
  if (isLink) {
    return function ArrayCell({ data }: ICellRendererParams) {
      if (Array.isArray(data[field])) {
        const cellData = [...data[field]].sort();

        const firstVal = cellData[0]?.replace(/(pmid:)|(#)/, '');

        let link = firstVal;
        let validLink = false;

        // firstVal might be non-link
        if (firstVal.match(/^\d+$/)) {
          link = `https://ncbi.nlm.nih.gov/pubmed/${firstVal}`;
          validLink = true;
        } else if (urlRegex.test(firstVal)) {
          validLink = true;
        }

        let linkComponent = firstVal;

        if (validLink) {
          linkComponent = (
            <a
              className="array-cell__link"
              href={link}
              rel="noopener noreferrer"
              target="_blank"
            >
              {firstVal}
            </a>
          );
        }

        return (
          <div>
            {linkComponent}
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
          {data[field]}
        </div>
      );
    };
  }

  return function ArrayCell({ data }: ICellRendererParams) {
    if (field === 'kbMatches') {
      const kbMatches = data[field];
      const kbVariants = kbMatches?.map((match) => match.kbVariant).filter((kbVariant) => kbVariant !== undefined);

      return (
        <div>
          {kbVariants?.join(', ')}
        </div>
      )
    } else if (field === 'variant') {
      const kbMatches = data['kbMatches'];
      const kbMatchesNonNull = kbMatches?.filter((match) => !Array.isArray(match));
      const variantArr = [];

      if (kbMatchesNonNull) {
        for (const kbMatch of kbMatchesNonNull) {
          switch (kbMatch?.variantType) {
            case ('cnv'):
              variantArr.push(`${kbMatch?.variant.gene.name} ${kbMatch?.variant.cnvState}`);
              break;
            case ('sv'):
              variantArr.push(`(${kbMatch?.variant.gene1.name || '?'
              },${kbMatch?.variant.gene2.name || '?'
              }):fusion(e.${kbMatch?.variant.exon1 || '?'
              },e.${kbMatch?.variant.exon2 || '?'
              })`);
              break;
            case ('mut'):
              variantArr.push(`${kbMatch?.variant.gene.name}:${kbMatch?.variant.proteinChange}`);
              break;
            case ('msi' || 'tmb'):
              variantArr.push(kbMatch?.variant.kbCategory);
              break;
            default:
              variantArr.push(`${kbMatch?.variant.gene.name} ${kbMatch?.variant.expressionState}`);
              break;
          }
        }
      }
      return (
        <div>
          {variantArr?.join(', ')}
        </div>
      )
    } else if (Array.isArray(data[field])) {
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
