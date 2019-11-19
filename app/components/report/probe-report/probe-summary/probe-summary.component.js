import template from './probe-summary.pug';
import patientTemplate from '../../genomic-report/genomic-summary/patient-edit.pug';
import '../../genomic-report/genomic-summary/genomic-summary.scss';

const bindings = {
  pog: '<',
  report: '<',
  reportEdit: '<',
  testInformation: '<',
  signature: '<',
  print: '<',
};

class ProbeSummaryComponent {
  /* @ngInject */
  constructor($scope, PogService, $mdDialog, $mdToast, ProbeSignatureService,
    PatientInformationService) {
    this.$scope = $scope;
    this.PogService = PogService;
    this.$mdDialog = $mdDialog;
    this.$mdToast = $mdToast;
    this.ProbeSignatureService = ProbeSignatureService;
    this.PatientInformationService = PatientInformationService;
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
              this.pog.POGID,
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

  // Sign The comments
  async sign(role) {
    try {
      const resp = await this.ProbeSignatureService.sign(
        this.pog.POGID, this.report.ident, role,
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
        this.pog.POGID, this.report.ident, role,
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
