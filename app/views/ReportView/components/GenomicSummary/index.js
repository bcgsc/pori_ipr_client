import { angular2react } from 'angular2react';
import sortBy from 'lodash.sortby';
import { $rootScope } from 'ngimport';

import dialogCreator from '@/services/utils/dialogCreator';
import toastCreator from '@/services/utils/toastCreator';
import lazyInjector from '@/lazyInjector';
import TumourAnalysisService from '@/services/reports/tumour-analysis.service';
import PatientInformationService from '@/services/reports/patient-information.service';
import GenomicAlterationsService from '@/services/reports/genomic-alterations.service';
import MutationSummaryService from '@/services/reports/mutation-summary.service';
import MutationSignatureService from '@/services/reports/mutation-signature.service';
import ProbeTargetService from '@/services/reports/probe-target.service';
import MicrobialService from '@/services/reports/microbial.service';
import template from './genomic-summary.pug';
import tumourTemplate from './tumour-analysis-edit.pug';
import mutationTemplate from './mutation-signature-edit.pug';
import patientTemplate from './patient-edit.pug';
import addAlterationTemplate from './add-alteration.pug';
import removeAlterationTemplate from './remove-alteration.pug';
import './index.scss';

const bindings = {
  print: '<',
  report: '<',
  reportEdit: '<',
};

class GenomicSummary {
  constructor($mdDialog, $mdToast) {
    this.$mdDialog = $mdDialog;
    this.$mdToast = $mdToast;
  }

  $onInit() {
    this.variantCounts = {
      cnv: 0,
      smallMutation: 0,
      expressionOutlier: 0,
      structuralVariant: 0,
    };
    this.mutationMask = null;
    this.helpMessages = {
      genomeStatus: {
        title: 'Genome Status Help',
        content: `Tumour content and ploidy are determined based on expert review of
                  copy number and allelic ratios observed across all chromosomes in the tumour.`,
      },
      tissueComparators: {
        title: 'Tissue Comparators Help',
        content: `The most appropriate normal tissue and tumour tissue types are chosen for
                  expression comparisons based on the tumour type and observed correlation
                  with tissue data sets. If no appropriate tissue comparator is available,
                  for instance for rare tumours, an average across all tissues is used. Outlier
                  expression refers to genes with very high or very low expression compared to
                  what is seen within the cohort(s) selected as comparator(s).`,
      },
      subtyping: {
        title: 'Subtyping Help',
        content: `Recent advances in genome-wide profiling provide an opportunity to investigate
                  global molecular changes during the development and progression of cancer.
                  Molecular subtyping is used to categorize cancer into homogeneous groups that
                  are considered to harbor similar molecular and clinical characteristics.
                  Furthermore, this has helped researchers to identify both actionable targets
                  for drug design as well as biomarkers for response prediction.`,
      },
      microbialContent: {
        title: 'Microbial Content Help',
        content: `This section includes information about a patients microbial content analysis.
                  <br><br>When identified, microbial analysis, is often useful is understanding
                  the biological mechanisms responsible for driving the formation of a particular
                  tumour.<br><br>Sequences observed with the tumour sample are compared to
                  databases of viral, bacterial and fungal sequences in addition to the human
                  genome. The species is reported if observed levels are suggestive of microbial
                  presence in the tumour sample. Specific viral integration sites are reported
                  if identified in genomic DNA sequence.`
        ,
      },
      mutationSignature: {
        title: 'Mutation Signature Help',
        content: `This section includes information about a patients mutation signature analysis.
                  Mutation signatures are characteristic combinations of mutation types arising
                  from specific mutagenesis (mutation causing processes). Deciphering mutational
                  signatures in cancer provides insight into the biological mechanisms involved
                  in carcinogenesis (formation of cancer) and normal somatic mutagenesis.
                  Mutational signatures have shown their applicability in cancer treatment and
                  cancer prevention.`,
      },
      mutationBurden: {
        title: 'Mutation Burden Help',
        content: `Mutational burden measures the quantity of mutations found in a tumour.
                  The number of protein coding alterations of each type, including both known and
                  novel events, are totaled and compared to other tumours of a similar type.`,
      },
    };
  }

  async $onChanges(changes) {
    if (changes.report && changes.report.currentValue) {
      const promises = await Promise.all([
        GenomicAlterationsService.all(this.report.ident),
        MutationSummaryService.get(this.report.ident),
        ProbeTargetService.all(this.report.ident),
        MutationSignatureService.all(this.report.ident),
        MicrobialService.get(this.report.ident),
      ]);
      [
        this.genomicAlterations,
        this.mutationSummary,
        this.probeTarget,
        this.mutationSignature,
        this.microbial,
      ] = promises;
      this.tumourAnalysis = this.report.tumourAnalysis;
      this.microbial = this.microbial || { species: 'None', integrationSite: 'None' };
      this.genomicAlterations = sortBy(this.processVariants(this.genomicAlterations), ['type', 'geneVariant']);
      $rootScope.$digest();
    }
  }

  /* eslint-disable-next-line class-methods-use-this */
  variantCategory(variant) {
    // small mutations
    if (/[:(][gcp]\./.exec(variant.geneVariant)) {
      variant.type = 'smallMutation';
      return variant;
    }
    // Structural Variants
    if (variant.geneVariant.includes('::') || variant.geneVariant.includes('fusion')) {
      variant.type = 'structuralVariant';
      return variant;
    }
    // Expression Outliers
    if (variant.geneVariant.toLowerCase().includes('express')
      || variant.geneVariant.toLowerCase().includes('outlier')
      || variant.geneVariant.toLowerCase().includes('percentile')
    ) {
      variant.type = 'expressionOutlier';
      return variant;
    }
    variant.type = 'cnv';
    return variant;
  }

  // Process variants and create chunks
  processVariants(variants) {
    const output = [];

    // Reset counts
    this.variantCounts = {
      cnv: 0,
      smallMutation: 0,
      expressionOutlier: 0,
      structuralVariant: 0,
    };

    variants.forEach((variant, k) => {
      // Add processed Variant
      output.push(this.variantCategory(variant));

      // Update counts
      if (!this.variantCounts[this.genomicAlterations[k].type]) {
        this.variantCounts[this.genomicAlterations[k].type] = 0;
      }
      this.variantCounts[this.genomicAlterations[k].type] += 1;
    });
    return output;
  }


  setMutationMask(mask) {
    if (this.mutationMask === mask) {
      this.mutationMask = null;
    } else {
      this.mutationMask = mask;
    }
  }

  mutationFilter(mutation) {
    return (mutation.type === this.mutationMask || this.mutationMask === null);
  }

  // Update Tumour Analysis Details
  async updateTumourAnalysis($event) {
    try {
      const resp = await this.$mdDialog.show({
        targetEvent: $event,
        template: tumourTemplate,
        clickOutToClose: false,
        parent: angular.element(document.body),
        controller: ['scope', (scope) => {
          scope.tumourAnalysis = this.tumourAnalysis;
          scope.cancel = () => {
            this.$mdDialog.cancel('Tumour analysis details were not updated');
          };
          scope.update = async (form) => {
            // Check for valid inputs by touching each entry
            if (form.$invalid) {
              form.$setDirty();
              form.$error.forEach((field) => {
                field.forEach((errorField) => {
                  errorField.$setTouched();
                });
              });
              return;
            }
            try {
              await TumourAnalysisService.update(
                this.report.ident, scope.tumourAnalysis,
              );
              this.$mdDialog.hide('Tumour analysis details have been successfully updated');
            } catch (err) {
              this.$mdToast.show(toastCreator(
                `Tumour analysis details were not updated due to an error: ${err}`,
              ));
            } finally {
              scope.$digest();
            }
          };
        }],
      });
      this.$mdToast.show(toastCreator(resp));
    } catch (err) {
      this.$mdToast.show(toastCreator(err));
    }
  }

  // Update Mutation Signature Details
  async updateMutationSignature($event) {
    try {
      const resp = await this.$mdDialog.show({
        targetEvent: $event,
        template: mutationTemplate,
        clickOutToClose: false,
        parent: angular.element(document.body),
        controller: ['scope', (scope) => {
          scope.tumourAnalysis = angular.copy(this.tumourAnalysis);
          scope.mutationSignature = angular.copy(this.mutationSignature);
          scope.cancel = () => {
            this.$mdDialog.cancel('Mutation signature details were not updated');
          };
          scope.update = async () => {
            try {
              await TumourAnalysisService.update(
                this.report.ident, scope.tumourAnalysis,
              );
              this.$mdDialog.hide({
                message: 'Mutation signature details have been successfully updated',
                data: scope.tumourAnalysis,
              });
            } catch (err) {
              this.$mdToast.show(toastCreator(
                `Mutation signature details were not updated due to an error: ${err}`,
              ));
            } finally {
              scope.$digest();
            }
          };
        }],
      });
      this.$mdToast.show(toastCreator(resp.message));
      this.tumourAnalysis = resp.data;
    } catch (err) {
      this.$mdToast.show(toastCreator(err));
    }
  }

  // Update Patient Information
  async updatePatient($event) {
    try {
      const resp = await this.$mdDialog.show({
        targetEvent: $event,
        template: patientTemplate,
        clickOutToClose: false,
        parent: angular.element(document.body),
        controller: ['scope', (scope) => {
          scope.patientId = this.report.patientId;
          scope.patientInformation = { ...this.report.patientInformation };
          scope.biopsyName = this.report.biopsyName;
          scope.cancel = () => {
            this.$mdDialog.cancel('Patient information was not updated');
          };
          scope.update = async (form) => {
            try {
              const response = await PatientInformationService.update(
                this.report.ident,
                scope.patientInformation,
              );
              this.$mdDialog.hide({
                message: 'Patient information has been successfully updated',
                report,
                patientInfo,
              });
            } catch (err) {
              this.$mdToast.show(toastCreator(
                `Patient information was not updated due to an error: ${err}`,
              ));
            }
          };
        }],
      });
      this.$mdToast.show(toastCreator(resp.message));
      this.report.patientInformation = resp.data;
      $rootScope.$digest();
    } catch (err) {
      this.$mdToast.show(toastCreator(err));
    }
  }


  async addAlteration($event) {
    try {
      const resp = await this.$mdDialog.show({
        targetEvent: $event,
        template: addAlterationTemplate,
        clickOutToClose: false,
        parent: angular.element(document.body),
        controller: ['scope', (scope) => {
          scope.cancel = () => {
            this.$mdDialog.cancel('Alteration was not added');
          };
          // Perform Update/Change
          scope.add = async () => {
            try {
              // Remove entry
              const genomicResp = await GenomicAlterationsService.create(
                this.report.ident, scope.alteration,
              );
              // Add to array of alterations
              this.genomicAlterations.push(genomicResp);
              // Reprocess variants
              this.genomicAlterations = this.processVariants(this.genomicAlterations);
              this.genomicAlterations = sortBy(this.genomicAlterations, 'type');
              this.$mdDialog.hide({
                status: true,
                message: 'Alteration has been successfully added',
              });
            } catch (err) {
              this.$mdDialog.hide({
                status: false,
                message: `Alteration was not added due to an error: ${err}`,
              });
            } finally {
              scope.$digest();
            }
          };
        }],
      });
      this.$mdToast.show(toastCreator(resp.message));
    } catch (err) {
      this.$mdToast.show(toastCreator(err));
    }
  }

  async removeAlteration($event, alteration) {
    try {
      const resp = await this.$mdDialog.show({
        targetEvent: $event,
        template: removeAlterationTemplate,
        clickOutToClose: false,
        parent: angular.element(document.body),
        controller: ['scope', (scope) => {
          scope.alteration = alteration;
          scope.cancel = () => {
            this.$mdDialog.cancel('Alteration was not removed');
          };
          // Perform Update/Change
          scope.update = async () => {
            try {
              await GenomicAlterationsService.remove(
                this.report.ident,
                alteration.ident,
                scope.comment,
              );
              this.genomicAlterations = this.genomicAlterations.filter(r => r.ident !== alteration.ident);

              // Subtract count
              this.variantCounts[alteration.type] -= 1;

              this.$mdDialog.hide({
                status: true,
                message: 'Successfully removed the alteration',
              });
            } catch (err) {
              this.$mdDialog.hide({
                status: true,
                message: `Unable to remove the alteration due to an error: ${err}`,
              });
            } finally {
              scope.$digest();
            }
          };
        }],
      });
      this.$mdToast.show(toastCreator(resp.message));
    } catch (err) {
      this.$mdToast.show(toastCreator(err));
    }
  }

  showHelpMessage($event, message) {
    this.$mdDialog.show(
      dialogCreator({
        $event,
        text: message.content,
        title: 'Help',
        actions: [{ text: 'Close', click: this.$mdDialog.hide }],
      }),
    );
  }
}

GenomicSummary.$inject = ['$mdDialog', '$mdToast'];

export const GenomicSummaryComponent = {
  template,
  bindings,
  controller: GenomicSummary,
};

export default angular2react('genomicSummary', GenomicSummaryComponent, lazyInjector.$injector);
