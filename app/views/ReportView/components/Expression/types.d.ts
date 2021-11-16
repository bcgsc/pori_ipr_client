import {
  ComparatorType, ExpOutliersType,
} from '@/common';

type KeyValType = {
  key: string;
  value: string;
};

type TissueSitesType = KeyValType[][];

type FormattedComparatorsType = KeyValType[];

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
