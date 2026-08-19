import { getColor, getLuminance } from '../colors';

const black = { red: 0, green: 0, blue: 0 };
const white = { red: 255, green: 255, blue: 255 };

describe('getColor', () => {
  test('returns the lower colour at ratio 0', () => {
    expect(getColor(black, white, 0)).toEqual(black);
  });

  test('returns the upper colour at ratio 1', () => {
    expect(getColor(black, white, 1)).toEqual(white);
  });

  test('interpolates each channel at a mid ratio', () => {
    expect(getColor(black, { red: 100, green: 200, blue: 50 }, 0.5)).toEqual({
      red: 50, green: 100, blue: 25,
    });
  });

  test('floors fractional channel values', () => {
    expect(getColor(black, { red: 10, green: 10, blue: 10 }, 0.55)).toEqual({
      red: 5, green: 5, blue: 5,
    });
  });
});

describe('getLuminance', () => {
  test('is zero for black', () => {
    expect(getLuminance(black)).toBe(0);
  });

  test('weights the channels by the luma coefficients', () => {
    expect(getLuminance({ red: 255, green: 0, blue: 0 })).toBeCloseTo(0.2126 * 255);
    expect(getLuminance({ red: 0, green: 255, blue: 0 })).toBeCloseTo(0.7152 * 255);
    expect(getLuminance({ red: 0, green: 0, blue: 255 })).toBeCloseTo(0.0722 * 255);
  });
});
