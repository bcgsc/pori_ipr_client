import { ICellRendererParams } from '@ag-grid-community/core';
import React, {
  useCallback, useEffect, useRef, useState,
} from 'react';

import './index.scss';

enum DisplayMode {
  normal, compact,
}

type HTMLCellRendererProps = ICellRendererParams & {
  mode: DisplayMode;
};

const APP_TEXT_CELL_MIN_HEIGHT = 250;

const HTMLCellRenderer = (props: HTMLCellRendererProps) => {
  const {
    data: { text }, node, api, mode = DisplayMode.normal,
  } = props;
  const [dispMode, setDispMode] = useState(mode);
  const cellRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      // onRowHeightChanged would cause ResizeObserver's loop to prematurely terminate
      // https://github.com/juggle/resize-observer/issues/103#issuecomment-1711148285
      setTimeout(() => {
        if (cellRef.current) {
          for (const entry of entries) {
            const { height } = cellRef.current.getBoundingClientRect();
            if (
              Number((entry.target as HTMLElement).style.height)
              !== height
            ) {
              const htmlContainer = cellRef.current.closest('.HTMLCellRenderer__content');
              if (dispMode === DisplayMode.normal) {
                node.setRowHeight(entry.contentRect.height);
                api.onRowHeightChanged();
              } else {
                if (htmlContainer.clientHeight < APP_TEXT_CELL_MIN_HEIGHT) {
                  (htmlContainer.closest('[role="gridcell"]') as HTMLElement).style.overflow = 'hidden';
                }
                node.setRowHeight(height < APP_TEXT_CELL_MIN_HEIGHT ? height : APP_TEXT_CELL_MIN_HEIGHT);
                api.onRowHeightChanged();
              }
            }
          }
        }
      }, 0);
    });

    if (cellRef.current) {
      resizeObserver.observe(cellRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [api, node, dispMode]);

  const handleOnClick = useCallback((evt) => {
    const gridCellElem = evt.target.closest('[role="gridcell"]');

    setDispMode((prevMode) => {
      if (prevMode === DisplayMode.normal) {
        if (gridCellElem.clientHeight > APP_TEXT_CELL_MIN_HEIGHT) {
          gridCellElem.style.overflow = 'auto';
        }
        return DisplayMode.compact;
      }
      gridCellElem.style.overflow = 'hidden';
      return DisplayMode.normal;
    });
  }, []);

  return (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events
    <div
      className="HTMLCellRenderer__content"
      onClick={handleOnClick}
      ref={cellRef}
      role="button"
      tabIndex={0}
    >
      <div dangerouslySetInnerHTML={{ __html: text }} />
    </div>
  );
};

export {
  DisplayMode,
  HTMLCellRenderer,
};
export default HTMLCellRenderer;
