import template from './genomic-summary.pug';
import tumourTemplate from './tumour-analysis-edit.pug';
import mutationTemplate from './mutation-signature-edit.pug';
import patientTemplate from './patient-edit.pug';
import addAlterationTemplate from './add-alteration.pug';
import removeAlterationTemplate from './remove-alteration.pug';
import './genomic-summary.scss';

const bindings = {
  pog: '<',
  report: '<',
  genomicAlterations: '<',
  variantCounts: '<',
  genomicEvents: '<',
  mutationSummary: '<',
  probeTarget: '<',
  mutationSignature: '<',
  microbial: '<',
};

class GenomicSummaryComponent {
  /* @ngInject */
  constructor($state, $scope, PogService, TumourAnalysisService, PatientInformationService,
    MutationSummaryService, GenomicAlterationsService, AclService, $mdDialog, $mdToast) {
    this.$state = $state;
    this.$scope = $scope;
    this.PogService = PogService;
    this.TumourAnalysisService = TumourAnalysisService;
    this.PatientInformationService = PatientInformationService;
    this.MutationSummaryService = MutationSummaryService;
    this.GenomicAlterationsService = GenomicAlterationsService;
    this.AclService = AclService;
    this.$mdDialog = $mdDialog;
    this.$mdToast = $mdToast;
  }

  async $onInit() {
    this.variantCounts = {
      cnv: 0,
      smallMutation: 0,
      expressionOutlier: 0,
      structuralVariant: 0,
      variantsUnknown: this.variantCounts.variantsUnknown,
    };
    this.mutationMask = null;
    this.patientInformation = this.report.patientInformation;
    this.tumourAnalysis = this.report.tumourAnalysis;
    this.microbial = this.microbial || { species: 'None', integrationSite: 'None' };
    this.genomicAlterations = _.sortBy(this.genomicAlterations, 'type');
    this.geneVariants = this.processVariants(this.genomicAlterations);
  }

  /* eslint-disable-next-line class-methods-use-this */
  variantCategory(variant) {
    // Small Mutations
    if (variant.geneVariant.match(/([A-z0-9]*)\s(\([pcg]\.[A-z]*[0-9]*[A-z_0-9>]*\*?\))/g)) {
      variant.type = 'smallMutation';
      return variant;
    }
    // Structural Variants
    if (variant.geneVariant.match(/(([A-z0-9]*|\?)::([A-z0-9]*|\?)\s\(e([0-9]*|\?):e([0-9]*|\?)\))/g)) {
      variant.type = 'structuralVariant';
      return variant;
    }
    // Expression Outliers
    if (variant.geneVariant.toLowerCase().includes('expression')) {
      variant.type = 'expressionOutlier';
      return variant;
    }
    // Return CNV mutation
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
      variantsUnknown: this.variantCounts.variantsUnknown,
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
              await this.TumourAnalysisService.update(
                this.pog.POGID, this.report.ident, scope.tumourAnalysis,
              );
              this.$mdDialog.hide('Tumour analysis details have been successfully updated');
            } catch (err) {
              this.$mdToast.showSimple(
                `Tumour analysis details were not updated due to an error: ${err}`,
              );
            } finally {
              scope.$digest();
            }
          };
        }],
      });
      this.$mdToast.showSimple(resp);
    } catch (err) {
      this.$mdToast.showSimple(err);
    }
  }

  // Update Mutation Signature Details
  async updateMutationSignature($event) {
    try {
      const resp = await this.$mdDialog.show({
        targetEvent: $event,
        template: mutationTemplate,
        clickOutToClose: false,
        controller: ['scope', (scope) => {
          scope.tumourAnalysis = angular.copy(this.tumourAnalysis);
          scope.mutationSignature = angular.copy(this.mutationSignature);
          scope.cancel = () => {
            this.$mdDialog.cancel('Mutation signature details were not updated');
          };
          scope.update = async () => {
            try {
              await this.TumourAnalysisService.update(
                this.pog.POGID, this.report.ident, scope.tumourAnalysis,
              );
              this.$mdDialog.hide({
                message: 'Mutation signature details have been successfully updated',
                data: scope.tumourAnalysis,
              });
            } catch (err) {
              this.$mdToast.showSimple(
                `Mutation signature details were not updated due to an error: ${err}`,
              );
            } finally {
              scope.$digest();
            }
          };
        }],
      });
      this.$mdToast.showSimple(resp.message);
      this.tumourAnalysis = resp.data;
    } catch (err) {
      this.$mdToast.showSimple(err);
    }
  }

  // Update Patient Information
  async updatePatient($event) {
    try {
      const resp = await this.$mdDialog.show({
        targetEvent: $event,
        template: patientTemplate,
        clickOutToClose: false,
        controller: ['scope', (scope) => {
          scope.patientInformation = this.patientInformation;
          scope.cancel = () => {
            this.$mdDialog.cancel('Patient information was not updated');
          };
          scope.update = async () => {
            try {
              await this.PatientInformationService.update(this.pog.POGID, scope.patientInformation);
              this.$mdDialog.hide({
                message: 'Patient information has been successfully updated',
                data: scope.patientInformation,
              });
            } catch (err) {
              this.$mdToast.showSimple(
                `Patient information was not updated due to an error: ${err}`,
              );
            } finally {
              scope.$digest();
            }
          };
        }],
      });
      this.$mdToast.showSimple(resp.message);
      this.patientInformation = resp.data;
    } catch (err) {
      this.$mdToast.showSimple(err);
    }
  }


  async addAlteration($event) {
    try {
      const resp = await this.$mdDialog.show({
        targetEvent: $event,
        template: addAlterationTemplate,
        clickOutToClose: false,
        controller: ['scope', (scope) => {
          scope.cancel = () => {
            this.$mdDialog.cancel('Alteration was not added');
          };
          // Perform Update/Change
          scope.add = async () => {
            try {
              // Remove entry
              const genomicResp = await this.GenomicAlterationsService.create(
                this.pog.POGID, this.report.ident, scope.alteration,
              );
              // Add to array of alterations
              this.genomicAlterations.push(genomicResp);
              // Reprocess variants
              this.genomicAlterations = this.processVariants(this.genomicAlterations);
              this.genomicAlterations = _.sortBy(this.genomicAlterations, 'type');
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
      this.$mdToast.showSimple(resp.message);
    } catch (err) {
      this.$mdToast.showSimple(err);
    }
  }

  async removeAlteration($event, alteration) {
    try {
      const resp = await this.$mdDialog.show({
        targetEvent: $event,
        template: removeAlterationTemplate,
        clickOutToClose: false,
        controller: ['scope', (scope) => {
          scope.alteration = alteration;
          scope.cancel = () => {
            this.$mdDialog.cancel('Alteration was not removed');
          };
          // Perform Update/Change
          scope.update = async (cascade) => {
            try {
              await this.GenomicAlterationsService.remove(
                this.pog.POGID,
                this.report.ident,
                alteration.ident,
                scope.comment,
                cascade,
              );
              this.genomicAlterations = _.reject(this.genomicAlterations, (r) => {
                return r.ident === alteration.ident;
              });

              if (cascade) {
                this.genomicEvents = _.reject(this.genomicEvents, (e) => {
                  return e.genomicEvent === alteration.geneVariant;
                });
              }

              // Subtract count
              this.variantCounts[alteration.type] -= 1;

              this.$mdDialog.hide({
                status: true,
                message: `Successfully removed the ${cascade ? 'alterations' : 'alteration'}`,
              });
            } catch (err) {
              this.$mdDialog.hide({
                status: true,
                message: `Unable to remove the ${cascade ? 'alterations' : 'alteration'} due to an error: ${err}`,
              });
            } finally {
              scope.$digest();
            }
          };
        }],
      });
      this.$mdToast.showSimple(resp.message);
    } catch (err) {
      this.$mdToast.showSimple(err);
    }
  }
}

export default {
  template,
  bindings,
  controller: GenomicSummaryComponent,
};
