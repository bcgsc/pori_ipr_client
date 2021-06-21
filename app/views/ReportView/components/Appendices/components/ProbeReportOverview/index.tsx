import React from 'react';
import {
  Typography,
} from '@material-ui/core';

import './index.scss';

const ProbeReportOverview = (): JSX.Element => (
  <div className="overview">
    <Typography variant="h3">Test Summary</Typography>
    <p>
      <strong>
        {'The Targeted Gene Report (TGR) provides rapid identification of a '}
        <span className="overview--underlined">select subset</span>
        {' of cancer-associated events.'}
        <ul>
          <li>
            This is not a complete description of mutations and fusions present in the tumour genome. A final comprehensive genomic report will generally follow.
          </li>
          <li>
            The absence of a specific mutation in this report is not a guarantee that the mutation is not present in the patient&apos;s tumour.
          </li>
          <li>
            Copy variants, including amplifications and large deletions, are not included in this report.
          </li>
          <li>
            Germline variants are not included in this report.
          </li>
        </ul>
      </strong>
    </p>
    <p>
      <strong>Test Method: </strong>
      In the TGR, whole genome and whole transcriptome sequence reads are computationally queried to identify somatic mutation and gene fusion events matching a specific list of known cancer-related aberrations. A subset of genes are examined for specific events which include, but are not limited to, individual gene mutations such as hotspot mutations in KRAS, BRAF and PIK3CA, and gene-pair fusions such as BCR-ABL1, EML4-ALK, and CCDC6-RET. Single nucleotide mutations and small insertions and deletions are identified from genome and transcriptome sequence data; gene fusion events are identified from transcriptome data. The TGR is generally followed by a final report, which will provide a more comprehensive description of both previously observed and novel aberrations, including copy number variants.
    </p>
    <p>
      The TGR is developed by Canada&apos;s Michael Smith Genome Sciences Centre, part of BC Cancer. Contents should be regarded as purely investigational and are intended for research purposes only.
    </p>
  </div>
);

export default ProbeReportOverview;
