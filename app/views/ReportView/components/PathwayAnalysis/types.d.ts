import { RecordDefaults } from '@/common';

type PathwayImageType = {
  // legendId references a global legend record; the report view stores/reads the
  // rendered legend through the report image store (key: pathwayAnalysis.legend).
  legendId: number | null;
  pathway: string | null;
} & RecordDefaults;

type LegendImageType = ImageType & {
  name: string;
  legendId: number;
};

export type { PathwayImageType, LegendImageType };
export default PathwayImageType;
