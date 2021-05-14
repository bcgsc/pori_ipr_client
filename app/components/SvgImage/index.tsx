import React, {
  useEffect, useState, useRef,
} from 'react';
import { UncontrolledReactSVGPanZoom } from 'react-svg-pan-zoom';
import InlineSVG from 'svg-inline-react';
import AutoSizer from 'react-virtualized/dist/es/AutoSizer';

import './index.scss';

type SvgImageProps = {
  image: string;
  isPrint?: boolean;
};

const PRINT_WIDTH = 816;
const ICON_WIDTH = 48;

const SvgImage = ({
  image,
  isPrint = false,
}: SvgImageProps): JSX.Element => {
  const Viewer = useRef();
  const [svgHeight, setSvgHeight] = useState<number>();
  const [svgWidth, setSvgWidth] = useState<number>();

  useEffect(() => {
    if (image) {
      const svg = new DOMParser().parseFromString(image, 'image/svg+xml');
      const [svgElem] = svg.getElementsByTagName('svg');
      setSvgHeight(svgElem.height.baseVal.value || PRINT_WIDTH);
      setSvgWidth(svgElem.width.baseVal.value || PRINT_WIDTH);
    }
  }, [image]);

  const handleFit = () => {
    Viewer?.current?.fitToViewer();
  };

  return (
    <div className="svg-image">
      {image && svgHeight && svgWidth && (
        <AutoSizer disableHeight defaultWidth={PRINT_WIDTH} onResize={handleFit}>
          {({ width }) => (
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
              customToolbar={isPrint ? () => null : undefined}
              toolbarProps={{ position: 'left' }}
            >
              <svg width={svgWidth} height={svgHeight}>
                <InlineSVG src={image} raw />
              </svg>
            </UncontrolledReactSVGPanZoom>
          )}
        </AutoSizer>
      )}
    </div>
  );
};

export default SvgImage;