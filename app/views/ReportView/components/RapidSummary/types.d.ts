import {
  CopyNumberType, RecordDefaults, SmallMutationType, StructuralVariantType, TmburType, AnyVariantType,
} from '@/common';

type RapidVariantType = (CopyNumberType | SmallMutationType | StructuralVariantType | TmburType) & {
  displayName: string,
  observedVariantAnnotation: {
    annotations: {
      rapidReportTableTag: string,
    },
    variantType: AnyVariantType,
  } & RecordDefaults
};

export {
  RapidVariantType,
};
