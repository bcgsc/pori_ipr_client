import template from './probe-summary.pug';
import patientTemplate from '../../genomic-report/genomic-summary/patient-edit.pug';
import eventsTemplate from './events-edit.pug';
import '../../genomic-report/genomic-summary/genomic-summary.scss';
import '../../genomic-report/genomic-report.scss';

const bindings = {
  report: '<',
  reportEdit: '<',
  testInformation: '<',
  signature: '<',
  targetedGenes: '<',
  print: '<',
};

class ProbeSummaryComponent {
  /* @ngInject */
  constructor($scope, $mdDialog, $mdToast, ProbeSignatureService,
    PatientInformationService, TargetedGenesService) {
    this.$scope = $scope;
    this.$mdDialog = $mdDialog;
    this.$mdToast = $mdToast;
    this.ProbeSignatureService = ProbeSignatureService;
    this.PatientInformationService = PatientInformationService;
    this.TargetedGenesService = TargetedGenesService;
  }

  $onInit() {
    this.patientInformation = this.report.patientInformation;
  }

  // Update Patient Information
  async updatePatient($event) {
    try {
      const resp = await this.$mdDialog.show({
        targetEvent: $event,
        template: patientTemplate,
        clickOutToClose: true,
        controller: ['scope', (scope) => {
          scope.patientInformation = angular.copy(this.patientInformation);

          scope.cancel = () => {
            this.$mdDialog.cancel('No changes were saved.');
          };

          scope.update = async () => {
            await this.PatientInformationService.update(
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
        this.$mdToast.show(this.$mdToast.simple().textContent(resp.message));
      }
      this.patientInformation = resp.data;
      this.report.patientInformation = this.patientInformation;
    } catch (err) {
      this.$mdToast.show(this.$mdToast.simple().textContent(err));
    }
  }

  async modifyEvent($event, event) {
    try {
      const resp = await this.$mdDialog.show({
        targetEvent: $event,
        template: eventsTemplate,
        clickOutToClose: true,
        controller: ['scope', (scope) => {
          scope.event = angular.copy(event);

          scope.cancel = () => {
            this.$mdDialog.cancel('No changes were saved.');
          };

          scope.update = async () => {
            await this.TargetedGenesService.update(
              this.report.ident,
              scope.event.ident,
              scope.event,
            );
            this.$mdDialog.hide({
              message: 'Entry has been updated',
              data: scope.event,
            });
          };
        }],
      });

      if (resp) {
        this.$mdToast.show(this.$mdToast.simple().textContent(resp.message));
        this.targetedGenes.forEach((ev, index) => {
          if (ev.ident === resp.data.ident) {
            this.targetedGenes[index] = resp.data;
          }
        });
      }
    } catch (err) {
      this.$mdToast.show(this.$mdToast.simple().textContent('No changes were saved.'));
    }
  }

  // Sign The comments
  async sign(role) {
    try {
      const resp = await this.ProbeSignatureService.sign(
        this.report.ident, role,
      );
      this.signature = resp;
      this.$scope.$digest();
    } catch (err) {
      this.$mdToast.showSimple('Unable to sign. Error: ', err);
    }
  }

  // Unsign The comments
  async revokeSign(role) {
    try {
      const resp = await this.ProbeSignatureService.revoke(
        this.report.ident, role,
      );
      this.signature = resp;
      this.$scope.$digest();
    } catch (err) {
      this.$mdToast.showSimple('Unable to revoke. Error: ', err);
    }
  }
}

export default {
  template,
  bindings,
  controller: ProbeSummaryComponent,
};
