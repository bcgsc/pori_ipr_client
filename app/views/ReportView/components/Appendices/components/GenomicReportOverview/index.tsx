import React from 'react';
import {
  Typography,
} from '@material-ui/core';

import './index.scss';

const GenomicReportOverview = (): JSX.Element => (
  <div className="overview">
    <Typography variant="h5">Report Overview</Typography>
    <div>
      <p>The Tumour Genome Analysis report provides a comprehensive description of the somatic genetic alterations present in a tumour. All protein coding genes in the genome are assessed for alterations of all types, including substitutions, deletions, gene fusions, amplification, and overexpression. Both known and novel alterations which affect genes of potential clinical relevance are included in the report. Germline variants are not generally included in this report.</p>
      <p>The Tumour Genome Analysis report is developed by Canada&#39;s Michael Smith Genome Sciences Centre, part of BC Cancer. Contents should be regarded as purely investigational and are intended for research purposes only.</p>
    </div>

    <Typography variant="h5">Methods Overview</Typography>
    <div>
      <p>The complete report is based on whole genome sequencing of tumour and matched normal DNA, and whole transcriptome sequencing of tumour RNA. Tumour and normal sequences are compared to the reference human genome to identify tumour-specific alterations including single nucleotide variants, small insertions and deletions, copy number changes, and structural variants such as translocations. Additionally, RNA sequences are used to measure expression of all genes, and genes with over and under-expression compared to reference tissues are identified. Somatic changes are cross-referenced to databases of therapeutic, diagnostic, prognostic, and biological information, pinpointing the alterations most likely to have clinical relevance. This comprehensive tumour description is expert reviewed by a Genome Analyst, highlighting potential driver mutations, providing pathway context, interpreting results in tumour type context, and refining potential therapeutic targets.</p>
    </div>

    <Typography variant="h5">Detailed Methods</Typography>
    <div>
      <p>
        <strong>Genome status: </strong>
        Tumour content and ploidy are determined based on expert review of copy number and allelic ratios from whole genome sequencing data observed across all chromosomes in the tumour.
      </p>
      <p>
        <strong> Tissue comparators and expression comparisons: </strong>
        The most appropriate normal tissue and tumour tissues are chosen for expression comparisons based on the tumour type and observed correlation with tissue data sets. If no appropriate tissue comparator is available, for instance for rare tumours, an average across all tissues is used. Expression is calculated as percentile and kIQR (number of interquartile ranges) relative to comparator expression distributions. Outlier expression refers to genes with very high or very low expression compared to what is seen in other cancers of that type and also compared to relevant normal tissue.
      </p>
      <p>
        <strong>Key genomic and transcriptomic alterations: </strong>
        The subset of alterations which have a previously described or inferred effect on genes of clinical or biological significance are summarized, with details of significance provided in the Knowledgebase Matches section, and details of the exact alteration provided in the section of the report corresponding to that mutation type. Additional alterations which do not have an inferred oncogenic or clinically relevant functional effect, are variants of uncertain significance (VUS), and are only listed in the subsequent sections of the report. Alterations in genes which are not associated with cancer, cancer pathways, or therapeutics, may not be included in the genomic report but are available upon request.
      </p>
      <p>
        <strong>Analyst comments: </strong>
        Text summary of the genomic and transcriptomic analysis for the case, based on manual case review, written by the genome analyst. This section contains interpretation of the genomic findings including references to relevant published literature and clinical trials.
      </p>
      <p>
        <strong>Pathway analysis: </strong>
        Visual summary of the key genomic and expression alterations, placed in a pathway context. Genes and pathways shown are dependent on the cancer type and the alterations specific to the individual tumour.
      </p>
      <p>
        <strong>Potential therapeutic targets: </strong>
        Tumour alterations are reviewed and those representing the most likely potential therapeutic targets are highlighted, with details on the associated therapy or general drug class, level of evidence, and any relevant clinical trials. Potential caveats are also specified. Alterations associated with potential resistance to relevant therapies are also documented.
      </p>
      <p>
        <strong>Knowledgebase matches: </strong>
        Tumour alterations with specific therapeutic, prognostic, diagnostic or biological associations are identified using the expert curated knowledgebase GraphKB, which integrates information from sources including cancer databases, drug databases, clinical tests, and the literature. Associations are listed by the level of evidence for the use of that drug in the context of the observed alteration, including those that are approved in this or other cancer types, and those that have early clinical or preclinical evidence.
      </p>
      <p>
        <strong>Microbial content: </strong>
        Sequences are compared to databases of viral, bacterial and fungal sequences in addition to the human genome. The microbial species is reported if observed levels are suggestive of microbial presence in the tumour sample. Specific viral integration sites are reported if identified in genomic DNA sequence.
      </p>
      <p>
        <strong>Expression correlation: </strong>
        The overall gene expression in the tumour is compared to a gene expression profiles from variety of tumour types, either from internal or external curated datasets,  using a correlation approach, to highlight the most similar tumour types. In addition, the tumour is compared to previously sequenced tumours to identify the most similar individual samples. Subtyping based on gene expression is computed if applicable for the tumour type.
      </p>
      <p>
        <strong>Mutation signatures: </strong>
        The pattern of specific base changes and base context of single nucleotide variants, small insertions and deletions in the tumour, referred to as the mutation signature, is computed and compared to patterns previously observed in a wide variety of tumour types. Signatures that suggest a particular mutation etiology, such as exposure to a specific mutagen, are noted.
      </p>
      <p>
        <strong>Mutation burden: </strong>
        This is reported in mutations per megabase in the genome. Additionally, the number of protein coding alterations of each type are totaled and compared to other tumours of a similar type. When a suitable tumour-specific cohort is not available for comparison, these are compared to an “average” cohort which is not tumour type specific but rather composed of all tumour types.
      </p>
      <p>
        <strong>Microsatellite instability: </strong>
        The percentage of microsatellites measured in the whole genome sequence that show evidence of instability. MSI status (MSI or MSS) is inferred based on this percentage.
      </p>
      <p>
        <strong>Immune: </strong>
        Evidence for immune cells in the tumour sample, potentially representing tumour-infiltrating lymphocytes, are predicted based on analysis of expression patterns in RNA data. The total T cell score (T.cell.infiltration) represents the total of all T cell scores excluding the negative regulatory T cells. The specific HLA alleles found in sequenced samples, representing MHC class I types, are predicted based on alignment of DNA and RNA to databases of known HLA sequences.
      </p>
      <p>
        <strong>Somatic and Expression: </strong>
        Details of small mutations (single nucleotide variants and small insertions and deletions), copy number alterations, structural variants, and genes with increased or decreased expression are provided in the respective sections.
      </p>
      <p>
        <strong>Additional analysis: </strong>
        Bespoke analysis for individual samples, including comparison among multiple samples from the same tumour, cancer-specific subtyping, and non-standard analysis approaches, may also be performed. Relevant results will be included in &#39;Additional Information&#39; and &#39;Analyst Comments&#39;.
      </p>
    </div>
  </div>
);

export default GenomicReportOverview;
