interface IColor {
  red: number;
  green: number;
  blue: number;
}

const getColor = (lowerColor: IColor, upperColor: IColor, ratio: number): IColor => {
  const newColor = {
    red: Math.floor(lowerColor.red + ratio * (upperColor.red - lowerColor.red)),
    green: Math.floor(lowerColor.green + ratio * (upperColor.green - lowerColor.green)),
    blue: Math.floor(lowerColor.blue + ratio * (upperColor.blue - lowerColor.blue)),
  };

  return newColor;
};

/** Values are from RGB -> Luma formula: Y = 0.2126 R + 0.7152 G + 0.0722 B */
const getLuminance = (color: IColor): number => {
  /** Compute sRGB, then linear RGB */
  for (let col of Object.values(color)) {
    col /= 255;
    if (col <= 0.03928) {
      col /= 12.92;
    } else {
      col = ((col + 0.055) / 1.055) ** 2.4;
    }
  }

  /** Calculate luminance from linear RGB */
  return 0.2126 * color.red + 0.7152 * color.green + 0.0722 * color.blue;
};

export {
  IColor,
  getColor,
  getLuminance,
};
