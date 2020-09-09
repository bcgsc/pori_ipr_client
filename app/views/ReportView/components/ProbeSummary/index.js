import { angular2react } from 'angular2react';
import { $rootScope } from 'ngimport';

import toastCreator from '@/utils/toastCreator';
import lazyInjector from '@/lazyInjector';
import { getSignatures, sign, revokeSignature } from '@/services/reports/signatures';
import PatientInformationService from '@/services/reports/patient-information.service';
import TargetedGenesService from '@/services/reports/targeted-genes.service';
import GeneService from '@/services/reports/gene.service';
import TestInformationService from '@/services/reports/test-information.service';
import template from './probe-summary.pug';
import patientTemplate from './patient-edit.pug';
import eventsTemplate from './events-edit.pug';
import './old.scss';

const bindings = {
  report: '<',
  canEdit: '<',
  loadedDispatch: '<',
  print: '<',
};

class ProbeSummary {
  constructor($mdDialog, $mdToast) {
    this.$mdDialog = $mdDialog;
    this.$mdToast = $mdToast;
  }

  $onInit() {
    this.loading = true;
  }

  async $onChanges(changes) {
    if (changes.report && changes.report.currentValue) {
      const promises = [
        TestInformationService.retrieve(this.report.ident),
        getSignatures(this.report.ident),
        TargetedGenesService.getAll(this.report.ident),
      ];
      const [testInformation, signatures, probeResults] = await Promise.all(promises);

      this.testInformation = testInformation;
      this.signatures = signatures;
      this.probeResults = probeResults;
      this.patientInformation = this.report.patientInformation;
      this.loading = false;
      if (this.loadedDispatch) {
        this.loadedDispatch({ type: 'probeSummary' });
      }
      $rootScope.$digest();
    }
  }

  // Update Patient Information
  async updatePatient($event) {
    try {
      const resp = await this.$mdDialog.show({
        targetEvent: $event,
        template: patientTemplate,
        clickOutToClose: true,
        parent: angular.element(document.body),
        controller: ['scope', (scope) => {
          scope.patientInformation = angular.copy(this.patientInformation);

          scope.cancel = () => {
            this.$mdDialog.cancel('No changes were saved.');
          };

          scope.update = async () => {
            await PatientInformationService.update(
              scope.patientInformation,
            );
            this.$mdDialog.hide({
              message: 'Entry has been updated',
              data: scope.patientInformation,
            });
          };
        }],
      });
      if (resp) {
        this.$mdToast.show(toastCreator(resp.message));
      }
      this.patientInformation = resp.data;
      this.report.patientInformation = this.patientInformation;
    } catch (err) {
      this.$mdToast.show(toastCreator(err));
    }
  }

  async modifyEvent($event, event) {
    try {
      const resp = await this.$mdDialog.show({
        targetEvent: $event,
        template: eventsTemplate,
        clickOutToClose: true,
        parent: angular.element(document.body),
        controller: ['scope', (scope) => {
          scope.event = angular.copy(event);

          scope.cancel = () => {
            this.$mdDialog.cancel('No changes were saved.');
          };

          scope.update = async () => {
            try {
              await TargetedGenesService.update(
                this.report.ident,
                scope.event.ident,
                {
                  comments: scope.event.comments,
                  variant: scope.event.variant,
                  gene: scope.event.gene.name,
                },
              );
              await GeneService.update(
                this.report.ident,
                event.gene.name,
                scope.event.gene,
              );
              this.$mdDialog.hide({
                message: 'Entry has been updated',
                data: scope.event,
              });
            } catch (err) {
              this.$mdDialog.cancel({
                message: `An error has occured: ${err}`,
                data: null,
              });
            }
          };
        }],
      });

      if (resp) {
        this.$mdToast.show(toastCreator(resp.message));
        this.probeResults.forEach((ev, index) => {
          if (ev.ident === resp.data.ident) {
            this.probeResults[index] = resp.data;
          }
        });
      }
    } catch (err) {
      this.$mdToast.show(toastCreator(err.message || 'Error: changes were not saved'));
    }
  }

  // Sign The comments
  async sign(role) {
    try {
      const resp = await sign(
        this.report.ident, role,
      );
      this.signatures = resp;
      $rootScope.$digest();
    } catch (err) {
      this.$mdToast.show(toastCreator('Unable to sign. Error: ', err));
    }
  }

  // Unsign The comments
  async revokeSign(role) {
    try {
      const resp = await revokeSignature(
        this.report.ident, role,
      );
      this.signatures = resp;
      $rootScope.$digest();
    } catch (err) {
      this.$mdToast.show(toastCreator('Unable to revoke. Error: ', err));
    }
  }
}

ProbeSummary.$inject = ['$mdDialog', '$mdToast'];

export const ProbeSummaryComponent = {
  template,
  bindings,
  controller: ProbeSummary,
};

export default angular2react('probeSummary', ProbeSummaryComponent, lazyInjector.$injector);
