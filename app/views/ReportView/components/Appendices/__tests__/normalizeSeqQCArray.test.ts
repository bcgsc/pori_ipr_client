// Jest provides describe, it, expect globally
import { normalizeSeqQCArray } from '../normalizeSeqQCArray';

describe('normalizeSeqQCArray', () => {
    it('should map legacy fields to new schema fields and prefer new fields', () => {
        const input = [
            {
                reads: 1000,
                sample: 'A',
                library: 'lib1',
                coverage: 30,
                inputNg: 50,
                inputUg: 0.05,
                protocol: 'proto',
                sampleName: 'SampleA',
                duplicateReadsPerc: 5,
                bioQC: 'pass',
                labQC: 'pass',
                Reads: 9999, // legacy field, should be ignored in favor of 'reads'
            },
            {
                Reads: 2000,
                Sample: 'B',
                Library: 'lib2',
                Coverage: 40,
                Input_ng: 60,
                Input_ug: 0.06,
                Protocol: 'proto2',
                'Sample Name': 'SampleB',
                Duplicate_Reads_Perc: 10,
                bioQC: 'fail',
                labQC: 'fail',
            },
        ];
        const output = normalizeSeqQCArray(input);
        expect(output).toEqual([
            {
                Reads: 1000,
                Sample: 'A',
                Library: 'lib1',
                Coverage: 30,
                Input_ng: 50,
                Input_ug: 0.05,
                Protocol: 'proto',
                'Sample Name': 'SampleA',
                Duplicate_Reads_Perc: 5,
                bioQC: 'pass',
                labQC: 'pass',
            },
            {
                Reads: 2000,
                Sample: 'B',
                Library: 'lib2',
                Coverage: 40,
                Input_ng: 60,
                Input_ug: 0.06,
                Protocol: 'proto2',
                'Sample Name': 'SampleB',
                Duplicate_Reads_Perc: 10,
                bioQC: 'fail',
                labQC: 'fail',
            },
        ]);
    });

    it('should return input if not an array', () => {
        expect(normalizeSeqQCArray(null)).toBe(null);
        expect(normalizeSeqQCArray(undefined)).toBe(undefined);
        expect(normalizeSeqQCArray({})).toEqual({});
    });
});
