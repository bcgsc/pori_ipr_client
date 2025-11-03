import {
  CopyNumberType, SmallMutationType, StructuralVariantType, TmburType,
} from '@/common';

type RapidVariantType = (CopyNumberType | SmallMutationType | StructuralVariantType | TmburType) & { displayName: string };

export {
  RapidVariantType,
};
