import {
  CopyNumberType,
  ExpOutliersType,
  KbMatchedStatementType,
  SmallMutationType,
  StructuralVariantType,
} from '@/common';
import { ImageType } from '@/components/Image';

type GeneViewerType = {
  copyNumber: CopyNumberType[];
  expDensityGraph: ImageType[];
  expRNA: ExpOutliersType[];
  kbMatchedStatements: KbMatchedStatementType[];
  smallMutations: SmallMutationType[];
  structuralVariants: StructuralVariantType[];
};

export {
  GeneViewerType,
};
