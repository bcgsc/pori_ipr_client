type SeqQCType = {
  Coverage: string;
  Duplicate_Reads_Perc: number;
  Input_ng: string;
  Input_ug: string;
  Library: string;
  Protocol: string;
  Reads: string;
  Sample: string;
  'Sample Name': string;
  bioQC: string;
  labQC: string;
};

type AppendicesType = {
  config: string;
  seqQC: SeqQCType[];
};

type TcgaType = {
  'Code Name': string;
  'Data Source': string;
  'Full Name': string;
  'Normal Count': string;
  'Tumour Count': string;
};

type ComparatorType = {
  analysisRole: string;
  createdAt: string;
  description: string | null;
  ident: string;
  name: string;
  size: number | null;
  updatedAt: string | null;
  version: string | null;
};

export {
  SeqQCType,
  AppendicesType,
  TcgaType,
  ComparatorType,
};
