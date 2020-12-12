import React from 'react';
import {
  Typography,
} from '@material-ui/core';

import './index.scss';

const GenomicReportOverview = (): JSX.Element => (
  <div className="overview">
    <Typography variant="h5">Report Overview</Typography>
    <div>
      <p>The Tumour Genome Analysis report provides a comprehensive description of the somatic genetic alterations present in a tumour. All genes in the genome are assessed for alterations of all types, including substitutions, deletions, gene fusions, amplification, and overexpression. Both known and novel alterations which affect genes of potential clinical relevance are included in the report. Germline variants are not generally included in this report.</p>
      <p>The Tumour Genome Analysis report is developed by Canada's Michael Smith Genome Sciences Centre, part of the BC Cancer Agency. Contents should be regarded as purely investigational and are intended for research purposes only.</p>
    </div>

    <Typography variant="h5">Methods Overview</Typography>
    <div>
      <p>The complete report is based on whole genome sequencing of tumour and matched normal DNA, and whole transcriptome sequencing of tumour RNA. Tumour and normal sequences are compared to the reference human genome to identify tumour-specific alterations including single nucleotide variants, small insertions and deletions, copy number changes, and structural variants such as translocations. Sequences are also assembled in a reference-independent manner to identify further structural alterations. Additionally, RNA sequences are used to measure expression of all genes, and genes with over and under-expression compared to reference tissues are identified. Somatic changes are cross-referenced to databases of therapeutic, diagnostic, prognostic, and biological information, pinpointing the alterations most likely to have clinical relevance. This comprehensive tumour description is expert reviewed by a Genome Analyst, highlighting potential driver mutations, providing pathway context, interpreting results in tumour type context, and refining potential therapeutic targets.</p>
    </div>

    <Typography variant="h5">Detailed Methods</Typography>
    <div>
      <p>
        <strong>Genome status:</strong>
        Tumour content and ploidy are determined based on expert review of copy number and allelic ratios observed across all chromosomes in the tumour .
      </p>
      <p>
        <strong> Tissue comparators and expression comparisons:</strong>
        The most appropriate normal tissue and tumour tissues are chosen for expression comparisons based on the tumour type and observed correlation with tissue data sets. If no appropriate tissue comparator is available, for instance for rare tumours, an average across all tissues is used. Fold change in expression is calculated compared to the normal tissue, and percentile expression is calculated compared to all tumour samples of that disease type. Outlier expression refers to genes with very high or very low expression compared to what is seen in other cancers of that type.
      </p>
      <p>
        <strong>Microbial content:</strong>
        Sequences are compared to databases of viral, bacterial and fungal sequences in addition to the human genome. The microbial species is reported if observed levels are suggestive of microbial presence in the tumour sample. Specific viral integration sites are reported if identified in genomic DNA sequence.
      </p>
      <p>
        <strong>Mutation signature:</strong>
        The pattern of specific base changes and base context of single nucleotide variants in the tumour, referred to as the mutation signature, is computed and compared to patterns previously observed in a wide variety of tumour types. Signatures that suggest a particular mutation etiology, such as exposure to a specific mutagen, are noted.
      </p>
      <p>
        <strong>Mutation burden:</strong>
        The number of protein coding alterations of each type, including both known and novel events, are totaled and compared to other tumours of a similar type. For SNVs and indels, this includes data from TCGA, while for structural variants, comparisons are only made among POG samples due to differences in how these variants are identified in TCGA.
      </p>
      <p>
        <strong>Key genomic and transcriptomic alterations:</strong>
        The subset of alterations which have a previously described effect on genes of clinical or biological significance are summarized, with details of significance provided in the Detailed Genomic Analysis section, and details of the exact alteration provided in the section of the report corresponding to that mutation type. Additional alterations in these genes, which have not been previously observed and do not have an inferred functional effect, are variants of uncertain significance (VUS), and are only listed in the subsequent sections of the report. Alterations in genes which are not associated with cancer, cancer pathways, or therapeutics, are not usually included in the genomic report but are available upon request to the Genome Sciences Centre.
      </p>
      <p>
        <strong>Genomic events with potential therapeutic association:</strong>
        The subset of alterations with specific therapeutic associations are identified using the Genome Sciences Centre's expert curated Knowledgebase, which integrates information from sources including cancer databases, drug databases, clinical tests, and the literature. Associations are listed by the level of evidence for the use of that drug in the context of the observed alteration, including those that are approved in this or other cancer types, and those that have early clinical or preclinical evidence.
      </p>
    </div>
  </div>
);

export default GenomicReportOverview;
