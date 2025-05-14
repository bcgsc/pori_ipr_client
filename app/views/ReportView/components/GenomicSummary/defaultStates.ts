import {
  ImmuneType, MsiType, MutationBurdenType, TmburType,
} from '@/common';
import { ComparatorType } from '../Appendices/types';

const defaultMutationBurden: MutationBurdenType = {
  ident: '',
  updatedAt: null,
  createdAt: null,
  codingIndelPercentile: null,
  codingIndelsCount: null,
  codingSnvCount: null,
  codingSnvPercentile: null,
  frameshiftIndelsCount: null,
  qualitySvCount: null,
  qualitySvExpressedCount: null,
  qualitySvPercentile: null,
  role: '',
  svBurdenHidden: null,
  totalIndelCount: null,
  totalMutationsPerMb: null,
  totalSnvCount: null,
  truncatingSnvCount: null,
};

const defaultTmbur: TmburType = {
  ident: '',
  updatedAt: null,
  createdAt: null,
  adjustedTmb: null,
  adjustedTmbComment: null,
  cdsBasesIn1To22AndXAndY: '',
  cdsIndels: 0,
  cdsIndelTmb: 0,
  cdsSnvs: 0,
  cdsSnvTmb: 0,
  comments: '',
  genomeSnvTmb: 0,
  genomeIndelTmb: 0,
  germline: null,
  kbCategory: null,
  kbMatches: [],
  msiScore: 0,
  nonNBasesIn1To22AndXAndY: '',
  normal: '',
  proteinIndels: 0,
  proteinIndelTmb: 0,
  proteinSnvs: 0,
  proteinSnvTmb: 0,
  tmbHidden: false,
  totalGenomeIndels: 0,
  totalGenomeSnvs: 0,
  tumour: '',
  variantType: 'tmb',
};

const defaultMsi: MsiType = {
  ident: '',
  updatedAt: null,
  createdAt: null,
  score: null,
  kbCategory: null,
  germline: null,
  variantType: 'msi',
};

const defaultImmune: ImmuneType = {
  ident: '',
  updatedAt: null,
  createdAt: null,
  cellType: null,
  kbCategory: null,
  percentile: null,
  score: null,
  pedsPercentile: null,
  pedsScore: null,
  pedsScoreComment: null,
  percentileHidden: false,
};

const defaultComparator: ComparatorType = {
  ident: '',
  updatedAt: null,
  createdAt: null,
  analysisRole: '',
  description: null,
  name: '',
  size: null,
  version: null,
};

export {
  defaultComparator,
  defaultImmune,
  defaultMutationBurden,
  defaultTmbur,
  defaultMsi,
};
