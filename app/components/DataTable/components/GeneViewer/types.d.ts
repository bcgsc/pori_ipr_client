import {
  CopyNumberType,
  ExpOutliersType,
  KbMatchType,
  SmallMutationType,
  StructuralVariantType,
} from '@/common';
import { ImageType } from '@/components/Image';

type GeneViewerType = {
  copyNumber: CopyNumberType[];
  expDensityGraph: ImageType[];
  expRNA: ExpOutliersType[];
  kbMatches: KbMatchType[];
  smallMutations: SmallMutationType[];
  structuralVariants: StructuralVariantType[];
};

export {
  GeneViewerType,
};
