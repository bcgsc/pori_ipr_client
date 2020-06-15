const EXPLEVEL = {
  OUT_HIGH: ['overexpressed', 'outlier_high', 'increased rna expression', 'high_percentile'],
  OUT_LOW: ['outlier_low', 'decreased rna expression', 'low_percentile'],
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
