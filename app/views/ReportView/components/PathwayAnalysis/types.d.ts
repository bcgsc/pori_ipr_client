import { RecordDefaults } from '@/common';

type PathwayImageType = {
  legend: 'v1' | 'v2' | 'v3' | 'custom' | null;
  original: 'string' | null;
  pathway: 'string' | null;
} & RecordDefaults;

export default PathwayImageType;
