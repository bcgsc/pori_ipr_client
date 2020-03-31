const EXPLEVEL = {
  OVEREXPRESSED: "overexpressed",
  OUT_HIGH: "outlier_high",
  OUT_LOW: "outlier_low",
  get UP() {
    return [this.OVEREXPRESSED, this.OUT_HIGH];
  },
}

const CNVSTATE = {
  GAIN: 'Gain',
  LOSS: 'Loss',
  HOMLOSS: 'Hom Loss',
  NEUTRAL: 'Neutral',
  AMP: 'Amp',
}

export {
  EXPLEVEL,
  CNVSTATE
};
