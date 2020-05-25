const EXPLEVEL = {
  OVEREXPRESSED: ['overexpressed'],
  OUT_HIGH: ['outlier_high', 'increased rna expression'],
  OUT_LOW: ['outlier_low', 'decreased rna expression', 'low_percentile'],
  get UP() {
    return [...this.OVEREXPRESSED, ...this.OUT_HIGH];
  },
};

const CNVSTATE = {
  GAIN: ['Gain', 'copy gain'],
  LOSS: ['Loss', 'copy loss'],
  HOMLOSS: ['Hom Loss', 'deep deletion', 'Homozygous Loss'],
  NEUTRAL: ['Neutral'],
  AMP: ['Amp', 'amplification'],
};

export {
  EXPLEVEL,
  CNVSTATE,
};
