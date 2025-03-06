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

const REPORT_TYPE_TO_TITLE = {
  genomic: 'Genomic',
  probe: 'Targeted Gene',
  pharmacogenomic: 'Pharmacogenomic and Cancer Predisposition Targeted Gene',
  rapid: 'Targeted Gene',
};

const REPORT_TYPE_TO_SUFFIX = {
  genomic: '',
  probe: 'Somatic',
  pharmacogenomic: 'Germline',
  rapid: '',
};

const MIN_KEYWORD_LENGTH = 2;
const DEFAULT_THRESHOLD = '0.8';
const ENTER_KEY = 'Enter';

export {
  REPORT_TYPE_TO_TITLE,
  REPORT_TYPE_TO_SUFFIX,
  EXPLEVEL,
  CNVSTATE,
  MIN_KEYWORD_LENGTH,
  DEFAULT_THRESHOLD,
  ENTER_KEY,
};
