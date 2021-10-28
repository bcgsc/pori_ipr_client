import {
  GeneType, RecordDefaults, KbMatchType, ComparatorType,
} from '@/common';

type KeyValType = {
  key: string;
  value: string;
};

type TissueSitesType = KeyValType[][];

type FormattedComparatorsType = KeyValType[];

type ExpOutliersType = {
  biopsySiteFoldChange: number | null;
  biopsySitePercentile: number | null;
  biopsySiteQC: number | null;
  biopsySiteZScore: number | null;
  biopsySitekIQR: number | null;
  diseaseFoldChange: number | null;
  diseasePercentile: number | null;
  diseaseQC: number | null;
  diseaseZScore: number | null;
  diseasekIQR: number | null;
  expressionState: string | null;
  gene: GeneType;
  kbCategory: string | null;
  kbMatches: KbMatchType[];
  location: number | null;
  primarySiteFoldChange: number | null;
  primarySitePercentile: number | null;
  primarySiteQC: number | null;
  primarySiteZScore: number | null;
  primarySitekIQR: number | null;
  rnaReads: number | null;
  rpkm: number | null;
  tpm: number | null;
} & RecordDefaults;

type ProcessedExpressionOutliers = {
  clinical: ExpOutliersType[];
  nostic: ExpOutliersType[];
  biological: ExpOutliersType[];
  upreg_onco: ExpOutliersType[];
  downreg_tsg: ExpOutliersType[];
};

export {
  FormattedComparatorsType,
  ExpOutliersType,
  ProcessedExpressionOutliers,
  TissueSitesType,
  ComparatorType,
};
