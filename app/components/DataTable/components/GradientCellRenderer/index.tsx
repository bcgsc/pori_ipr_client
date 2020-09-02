import React from 'react';

import './index.scss';

type Color = {
  red: number,
  green: number,
  blue: number,
};

const LOWER_COLOR = {
  red: 134,
  green: 244,
  blue: 207,
};

const UPPER_COLOR = {
  red: 25,
  green: 96,
  blue: 121,
};

const getColor = (lowerColor: Color, upperColor: Color, ratio: number) => {
  const newColor = {
    red: Math.floor(lowerColor.red + ratio * (upperColor.red - lowerColor.red)),
    green: Math.floor(lowerColor.green + ratio * (upperColor.green - lowerColor.green)),
    blue: Math.floor(lowerColor.blue + ratio * (upperColor.blue - lowerColor.blue)),
  };

  return newColor;
};

const GradientCellRenderer = (params) => {
  const {
    value,
  } = params;

  console.log(value);

  const color = Object.values(getColor(LOWER_COLOR, UPPER_COLOR, value));
  const rgb = `rgb(${color.join(',')})`;

  return (
    <div className="gradient" style={{ width: `${value * 200}px` }}>
      <div className="gradient__value">{value}</div>
      <div className="gradient__line" style={{
        backgroundColor: rgb,
        width: `${value * 200}px`,
      }} />
    </div>
  )
};

export default GradientCellRenderer;
