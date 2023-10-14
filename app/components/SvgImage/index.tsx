import React, {
  useEffect, useState, useRef, useMemo, useCallback,
} from 'react';
import { UncontrolledReactSVGPanZoom } from 'react-svg-pan-zoom';
import InlineSVG from 'react-inlinesvg';
import AutoSizer from 'react-virtualized-auto-sizer';

import './index.scss';

type SvgImageProps = {
  image: string;
  isPrint?: boolean;
  printOrientation?: 'portrait' | 'landscape' | 'auto';
};

// These should be same as index.css under @page
// Accounts for padding via magical numbers 32 and 16
const INCH_TO_PX = 96;
const MAX_PRINT_WIDTH = Math.floor((9 - 0.4 * 2) * INCH_TO_PX) - 32;
const MAX_PRINT_HEIGHT = Math.floor((11.5 - 0.4 * 2) * INCH_TO_PX) - 64;

const PRINT_WIDTH = 816;
const ICON_WIDTH = 48;

const SvgImage = ({
  image,
  isPrint = false,
  // Only applicable when in print mode
  printOrientation = 'portrait',
}: SvgImageProps): JSX.Element => {
  const Viewer = useRef(null);
  const [svgHeight, setSvgHeight] = useState<number>();
  const [svgWidth, setSvgWidth] = useState<number>();
  const [processedImage, setProcessedImage] = useState('');
  useEffect(() => {
    if (processedImage) {
      const svg = new DOMParser().parseFromString(processedImage, 'image/svg+xml');
      const [svgElem] = svg.getElementsByTagName('svg');
      setSvgHeight(svgElem?.height?.baseVal?.value || PRINT_WIDTH);
      setSvgWidth(svgElem?.width?.baseVal?.value || PRINT_WIDTH);
    }
  }, [processedImage]);

  useEffect(() => {
    if (image) {
      const replacer = (matched: string) => {
        const prop = matched.match(/(?<=")[^:]+/);
        const val = matched.match(/(?<=:\s*)[^\s][^;]+/);
        return `${prop}="${val}"`;
      };
      /* This handles SVGs generated by Abobe Illustrator */
      /* Regex finds style="prop: value" in the svg tag and replaces with the attr prop="value" */
      setProcessedImage(
        image.replace(
          /(?<=<svg[^>]*?)style=((\\?"[^"]*?\\?")|(\\?'[^']*?\\?'))/g,
          replacer,
        ),
      );
    }
    return () => setProcessedImage('');
  }, [image]);

  const handleFit = useCallback(() => {
    Viewer?.current?.fitToViewer();
  }, []);

  const svgComponent = useMemo(() => {
    if (processedImage && svgHeight && svgWidth) {
      return (
        <AutoSizer disableHeight onResize={handleFit}>
          {({ width = PRINT_WIDTH }) => {
            if (isPrint) {
              let overHeightRatio;
              let overWidthRatio;

              switch (printOrientation) {
                case 'landscape':
                  overHeightRatio = svgHeight / MAX_PRINT_WIDTH;
                  overWidthRatio = svgWidth / MAX_PRINT_HEIGHT;
                  break;
                case 'auto':
                  if (svgWidth > svgHeight) {
                    overHeightRatio = svgHeight / MAX_PRINT_WIDTH;
                    overWidthRatio = svgWidth / MAX_PRINT_HEIGHT;
                  } else {
                    overHeightRatio = svgHeight / MAX_PRINT_HEIGHT;
                    overWidthRatio = svgWidth / MAX_PRINT_WIDTH;
                  }
                  break;
                default:
                  // portrait
                  overHeightRatio = svgHeight / MAX_PRINT_HEIGHT;
                  overWidthRatio = svgWidth / MAX_PRINT_WIDTH;
                  break;
              }

              let nextRatio = 1;

              if (overHeightRatio > 1 && overWidthRatio > 1) {
                // Both over, find higher ratio
                nextRatio = Math.max(overHeightRatio, overWidthRatio);
              } else if (overHeightRatio > 1) {
                nextRatio = overHeightRatio;
              } else if (overWidthRatio > 1) {
                nextRatio = overWidthRatio;
              }

              let transformCss = '';

              if (
                printOrientation === 'landscape'
                || (printOrientation === 'auto' && svgWidth > svgHeight)
              ) {
                transformCss = `rotate(90) translate(0 -${svgHeight * nextRatio})`;
              }

              return (
                <InlineSVG
                  src={processedImage}
                  transform-origin="top left"
                  transform={`
                    scale(${1 / nextRatio})
                    ${transformCss}
                  `}
                />
              );
            }
            return (
              <UncontrolledReactSVGPanZoom
                ref={Viewer}
                  /*
                     48px is removed since with a float icon to the right
                     then the SVG is moved down too far.
                  */
                width={width - ICON_WIDTH}
                height={svgHeight}
                background="#FFFFFF"
                detectAutoPan={false}
                defaultTool="auto"
                customMiniature={() => null}
                customToolbar={undefined}
                toolbarProps={{ position: 'left' }}
              >
                <svg width={svgWidth} height={svgHeight}>
                  <InlineSVG src={processedImage} />
                </svg>
              </UncontrolledReactSVGPanZoom>
            );
          }}
        </AutoSizer>
      );
    }
    return null;
  }, [isPrint, printOrientation, processedImage, svgHeight, svgWidth, handleFit]);

  return (
    <div className="svg-image">
      {svgComponent}
    </div>
  );
};

export default SvgImage;
