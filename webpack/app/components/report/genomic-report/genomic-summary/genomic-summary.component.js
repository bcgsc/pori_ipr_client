import template from './genomic-summary.pug';
import tumourTemplate from './tumour-analysis-edit.pug';
import mutationTemplate from './mutation-signature-edit.pug';
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
          scope.tumourAnalysis = this.tumourAnalysis;
          scope.mutationSignature = this.mutationSignature;
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
  updatePatient($event) {
    this.$mdDialog.show({
      targetEvent: $event,
      templateUrl: 'dashboard/report/genomic/summary/patientInformation.edit.html',
      clickOutToClose: false,
      controller: ['scope', (scope) => {
        scope.pi = angular.copy(this.data.pi); //

        scope.cancel = () => {
          $mdDialog.cancel('Patient information was not updated');
        };


        scope.update = () => {
          // Send updated entry to API
          $patientInformation.update(this.pog.POGID, scope.pi)
            .then(() => {
              $mdDialog.hide({ message: 'Patient information has been successfully updated', data: scope.pi });
            })
            .catch((error) => {
              $mdToast.showSimple(`Patient information was not updated due to an error: ${error}`);
            });
        }; // End update
      }], // End controller

    })
      .then((outcome) => {
        if (outcome) $mdToast.showSimple(outcome.message);
        this.data.pi = outcome.data;
      })
      .catch((error) => {
        $mdToast.showSimple(error);
      });
  } // End edit tumour analysis


  addAlteration($event) {
    this.$mdDialog.show({
      targetEvent: $event,
      templateUrl: 'dashboard/report/genomic/summary/alteration.add.html',
      clickOutToClose: false,
      controller: ['scope', (scope) => {
        scope.cancel = () => {
          $mdDialog.cancel('Alteration was not added');
        };

        // Perform Update/Change
        scope.add = () => {
          // Remove entry
          this.GenomicAlterationsService.create(pog.POGID, report.ident, scope.alteration)
            .then((resp) => {
              // Add to array of alterations
              this.genomicAlterations.push(resp);

              // Reprocess variants
              this.data.gai = processVariants(this.genomicAlterations);
              this.data.gai = _.sortBy(gai, 'type');

              $mdDialog.hide({ status: true, message: 'Alteration has been successfully added' });
            })
            .catch((error) => {
              $mdDialog.hide({ status: false, message: `Alteration was not added due to an error: ${error}` });
            });
        }; // End update
      }], // End controller
    })
      .then((outcome) => {
        if (outcome) $mdToast.showSimple(outcome.message);
      })
      .catch((error) => {
        $mdToast.showSimple(error);
      });
  }

  removeAlteration($event, alteration) {
    const tempAlteration = angular.copy(alteration);

    this.$mdDialog.show({
      targetEvent: $event,
      templateUrl: 'dashboard/report/genomic/summary/alteration.remove.html',
      clickOutToClose: false,
      controller: ['scope', (scope) => {
        scope.alteration = alteration;

        scope.cancel = () => {
          $mdDialog.cancel('Alteration was not removed');
        };

        // Perform Update/Change
        scope.update = (cascade) => {
          // Remove entry
          this.GenomicAlterationsService.remove(pog.POGID, report.ident, alteration.ident, scope.comment, cascade)
            .then(() => {
              this.data.gai = _.reject(this.data.gai, (r) => { return (r.ident === alteration.ident); });
              this.genomicAlterations = _.reject(gai, (r) => { return (r.ident === alteration.ident); });


              // Remove from Get
              if (cascade) this.data.get = _.reject(this.data.get, (e) => { return (e.genomicEvent === alteration.geneVariant); });

              // Subtract count
              this.variantCounts[tempAlteration.type] -= 1;

              $mdDialog.hide({ status: true, message: `Successfully removed the ${cascade ? 'alterations' : 'alteration'}` });
            })
            .catch((error) => {
              $mdDialog.hide({ status: true, message: `Unable to remove the ${cascade ? 'alterations' : 'alteration'} due to an error: ${error}` });
            });
        }; // End update
      }], // End controller
    })
      .then((outcome) => {
        if (outcome) $mdToast.showSimple(outcome.message);
      })
      .catch((error) => {
        $mdToast.showSimple(error);
      });
  }
}

export default {
  template,
  bindings,
  controller: GenomicSummaryComponent,
};
