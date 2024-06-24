import { ITooltipParams } from '@ag-grid-community/core';
import {
  alpha, Box, BoxProps, Typography,
} from '@mui/material';
import { get } from 'lodash';
import React, { ReactNode, useEffect, useRef } from 'react';
import { v1 as createUuid } from 'uuid';

import './index.scss';

/**
 * @note in v23 of aggrid params.rowIndex does not update when rows moved and therefore cannot be trusted.
 * use params.node.rowIndex instead
 */
function tooltipValueGetter(params: ITooltipParams) {
  const { valueFormatted } = params;
  let { value = valueFormatted } = params;

  if (valueFormatted === undefined || valueFormatted === null) {
    const { api, column, node } = params;
    if (node?.rowIndex !== undefined) {
      if (!api || !column) { return 'unable to retrieve details'; }
      const { data } = api.getDisplayedRowAtIndex(node.rowIndex!) ?? {};
      const colId = (column).getColId?.();
      value = get(data, [colId], value);
    }

    if (value === undefined || value === null) {
      value = '- no value -';
    }
  }
  return value;
}

function basicTooltipValueGetter(params: ITooltipParams) {
  const { valueFormatted, value } = params;
  return valueFormatted ?? value;
}

const maybeZombies = new Set<string>();
const deleteZombieTooltips = (ids: string[]) => {
  if (ids.length) {
    for (const zombie of ids) {
      const zombieElem = document.getElementById(zombie);
      if (zombieElem) {
        zombieElem.style.display = 'none';
      }
      maybeZombies.delete(zombie);
    }
  }
};

function TooltipWrapper(props: { id?: string; disableRemoveZombies?: boolean; sx?: BoxProps['sx']; children: ReactNode | ReactNode[]; }) {
  const {
    id, disableRemoveZombies, sx, children,
  } = props;

  const zombieId = useRef<string>(id || createUuid());

  useEffect(() => {
    const { current } = zombieId;
    if (!disableRemoveZombies) {
      deleteZombieTooltips([...maybeZombies]);
    }
    maybeZombies.add(current);
    return () => {
      maybeZombies.delete(current);
    };
  }, [disableRemoveZombies]);

  return (
    <Box
      id={zombieId.current}
      sx={{
        '& .MuiListItemText-secondary': {
          color: 'rgb(170, 162, 162)',
        },
        '& table *': {
          color: 'var(--palette__common--white)',
        },
        '& th': {
          maxWidth: '30%',
          verticalAlign: 'top',
        },
        '& ul': {
          listStyle: 'none',
          margin: 0,
          padding: 0,
        },
        background: alpha('#000000', 0.7),
        borderRadius: '5px',
        color: 'common.white',
        padding: '5px',
        ...sx,
      }}
    >
      {children}
    </Box>
  );
}

type ToolTipProps = ITooltipParams & {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  reactContainer: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  DetailsComponent?: any;
  minWidth?: number;
  maxWidth?: number;
  whiteSpace?: React.CSSProperties['whiteSpace'];
  id?: string;
  /**
   * whether other tooltips should not
   * be forceably removed when a new tooltip appears (zombies)
   *
   * <b>
   * *this is only used by storybook
   * </b>
   * @default false
   */
  disableRemoveZombies?: boolean;
  /** other props provided by ag-grids tooltipComponentParams */
  [key: string]: unknown;
};

/**
 * component to tooltip for a cell
 *
 * @todo look into issue where tooltips on table with
 * domLayout='autoHeight' have incorrect vertical placement
 *
 * @note until [this issue](https://github.com/ag-grid/ag-grid/issues/3706) is fixed,
 * some tooltips will become zombies (non-existent as far as react is concerned) when
 * the mouse moves around/scrolls a lot.
 * The exact cause is unknown, but it causes their cleanup not to occur (including cleanup of effects).
 * In the meantime, each tooltip with be given an ID that will be tracked.
 * If the cleanup occurs as expected, this ID is ignored,
 * otherwise, the next time a tooltip is created, that ID is used to delete the zombie tooltip from the DOM.
 */
function ToolTip(props: ToolTipProps) {
  const {
    value = '',
    DetailsComponent,
    minWidth = 'fit-content',
    maxWidth = 600,
    disableRemoveZombies = false,
    whiteSpace,
    id,
  } = props;

  const hasDetailsComp = DetailsComponent !== undefined;

  let displayValue;

  if (hasDetailsComp) {
    displayValue = <DetailsComponent {...props} />;
  } else if (typeof value === 'object') {
    displayValue = 'no preview for value';
  } else {
    displayValue = (<Typography>{value}</Typography>);
  }

  return (
    <TooltipWrapper
      disableRemoveZombies={disableRemoveZombies}
      id={id}
      sx={{ maxWidth, minWidth, whiteSpace }}
    >
      {displayValue}
    </TooltipWrapper>
  );
}

export {
  basicTooltipValueGetter,
  ToolTip,
  tooltipValueGetter,
  TooltipWrapper,
};

export type { ToolTipProps };
