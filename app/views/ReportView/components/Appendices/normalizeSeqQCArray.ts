import { SeqQCType } from './types';

// Standalone normalization function for seqQC data
export function normalizeSeqQCArray(seqQC: unknown): SeqQCType[] {
    if (!Array.isArray(seqQC)) return seqQC as SeqQCType[];
    return (seqQC as Record<string, unknown>[]).map((item) => ({
        Reads: item.reads ?? item.Reads ?? '',
        Sample: item.sample ?? item.Sample ?? '',
        Library: item.library ?? item.Library ?? '',
        Coverage: item.coverage ?? item.Coverage ?? '',
        Input_ng: item.inputNg ?? item.Input_ng ?? '',
        Input_ug: item.inputUg ?? item.Input_ug ?? '',
        Protocol: item.protocol ?? item.Protocol ?? '',
        'Sample Name': item.sampleName ?? item['Sample Name'] ?? '',
        Duplicate_Reads_Perc: item.duplicateReadsPerc ?? item.Duplicate_Reads_Perc ?? '',
        bioQC: item.bioQC ?? '',
        labQC: item.labQC ?? '',
    })) as SeqQCType[];
}
