import { RecordDefaults } from '@/common';

type CorrelationType = {
  correlation: number;
  library: string;
  patientId: string;
  tissueType: string;
  tumourContent: number;
  tumourType: string;
} & RecordDefaults;

export default CorrelationType;
