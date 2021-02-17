import React from 'react';
import {
  Typography,
} from '@material-ui/core';

import './index.scss';

const ProbeReportOverview = (): JSX.Element => (
  <div className="overview">
    <Typography variant="h3">Test Summary</Typography>
    <p>
      <strong>The Report: </strong>
      The Targeted Gene Report (TGR) provides results from a rapid analysis pipeline designed to identify specific somatic alterations in a select set of cancer-associated genes and gene fusion events. This rapid analysis is not a complete description of aberrations present in the tumour genome. The absence of a specific mutation in this report is not a guarantee that the mutation is not present in the patient&apos;s tumour. Germline variants are not included in this report.
    </p>
    <p>
      <strong>Test Method: </strong>
      In the TGR, whole genome and whole transcriptome sequence reads are computationally queried to identify events matching a specific list of known cancer-related aberrations. A subset of genes is examined for specific events which include, but are not limited to, individual gene mutations such as hotspot mutations in KRAS, BRAF and PIK3CA, and gene-pair fusions such as BCR-ABL1, EML4-ALK, and CCDC6-RET. Genome and transcriptome sequence data are queried for individual gene mutations; only transcriptome data are queried for gene fusion events.
    </p>
    <p>
      <strong>Reporting of information of Potential Clinical Relevance: </strong>
      The TGR incorporates results from published peer-reviewed studies and other publicly available information through our in-house Knowledgebase - a curated database of cancer-associated genes and genomic alterations. Reported associations may include those of potential biological, diagnostic, prognostic and therapeutic significance. Therapeutic associations of potential clinical benefit (or potential lack of clinical benefit) are derived from public data and are not independently verified.
    </p>
    <p>
      This report will generally be followed by a final report, which will provide a more comprehensive description of both previously observed and novel aberrations.
    </p>
    <p>
      The TGR is developed by Canada&apos;s Michael Smith Genome Sciences Centre, part of the British Columbia Cancer Agency. Contents should be regarded as purely investigational and are intended for research purposes only.
    </p>
  </div>
);

export default ProbeReportOverview;
