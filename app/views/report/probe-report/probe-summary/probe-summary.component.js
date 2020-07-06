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
  probeResults: '<',
  print: '<',
};

class ProbeSummaryComponent {
  /* @ngInject */
  constructor($scope, $mdDialog, $mdToast, ProbeSignatureService,
    PatientInformationService, TargetedGenesService, GeneService) {
    this.$scope = $scope;
    this.$mdDialog = $mdDialog;
    this.$mdToast = $mdToast;
    this.ProbeSignatureService = ProbeSignatureService;
    this.PatientInformationService = PatientInformationService;
    this.TargetedGenesService = TargetedGenesService;
    this.GeneService = GeneService;
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
            try {
              await this.TargetedGenesService.update(
                this.report.ident,
                scope.event.ident,
                {
                  comments: scope.event.comments,
                  variant: scope.event.variant,
                  gene: scope.event.gene.name,
                },
              );
              await this.GeneService.update(
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
        this.$mdToast.show(this.$mdToast.simple().textContent(resp.message));
        this.probeResults.forEach((ev, index) => {
          if (ev.ident === resp.data.ident) {
            this.probeResults[index] = resp.data;
          }
        });
      }
    } catch (err) {
      this.$mdToast.show(this.$mdToast.simple().textContent(err.message || 'Error: changes were not saved'));
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
