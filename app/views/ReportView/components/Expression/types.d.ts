import { ExpOutliersType } from '@/common';

type KeyValType = {
  key: string;
  value: string;
};

type TissueSitesType = KeyValType[][];

type ComparatorsType = KeyValType[];

type ProcessedExpressionOutliers = {
  clinical: ExpOutliersType[];
  nostic: ExpOutliersType[];
  biological: ExpOutliersType[];
  upreg_onco: ExpOutliersType[];
  downreg_tsg: ExpOutliersType[];
};

export {
  ComparatorsType,
  ProcessedExpressionOutliers,
  TissueSitesType, ExpOutliersType,
};
