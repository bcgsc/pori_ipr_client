import template from './report-settings.pug';
import addTemplate from './role-add.pug';
import deleteTemplate from './report-delete.pug';
import './report-settings.scss';

const bindings = {
  pog: '<',
  report: '<',
  reportSettings: '<',
  showBindings: '<',
};

class ReportSettingsComponent {
  /* @ngInject */
  constructor($scope, $state, $mdDialog, $mdToast, PogService, ReportService, indefiniteArticleFilter) {
    this.$scope = $scope;
    this.$state = $state;
    this.$mdDialog = $mdDialog;
    this.$mdToast = $mdToast;
    this.PogService = PogService;
    this.ReportService = ReportService;
    this.indefiniteArticleFilter = indefiniteArticleFilter;
  }

  $onInit() {
    this.roles = ['bioinformatician', 'analyst', 'reviewer', 'admin', 'clinician'];
    this.reportSettingsChanged = false;

    this.reportCache = angular.copy(this.report);
  }

  // Unbind user
  async removeEntry(role) {
    const result = await this.ReportService.unbindUser(
      this.report.ident, role.user.ident, role.role,
    );
    this.report = result;
  }

  /* eslint-disable class-methods-use-this */
  roleFilter(filter) {
    return puser => (puser.role === filter);
  }

  // Update Patient Information
  async addUser($event, suggestedRole) {
    try {
      const outcome = await this.$mdDialog.show({
        targetEvent: $event,
        template: addTemplate,
        clickOutToClose: false,
        controller: ['scope', 'UserService', (scope, UserService) => {
          scope.role = { role: suggestedRole };

          scope.cancel = () => {
            this.$mdDialog.cancel();
          };

          scope.searchUsers = async (searchText) => {
            if (searchText.length === 0) {
              return [];
            }

            const resp = await UserService.search(searchText);
            return resp;
          };

          scope.add = async (f) => {
            // Check for valid inputs by touching each entry
            if (f.$invalid) {
              f.$setDirty();
              Object.values(f.$error).forEach((field) => {
                field.forEach((errorField) => {
                  errorField.$setTouched();
                });
              });
              return;
            }

            // Perform binding
            const resp = await this.ReportService.bindUser(
              this.report.ident, scope.role.user.ident, scope.role.role,
            );
            this.$mdDialog.hide({
              data: resp,
              message: `${scope.role.user.firstName} ${scope.role.user.lastName} has been added as ${this.indefiniteArticleFilter(scope.role.role)} ${scope.role.role}`,
            });
          };
        }],
      });
      if (outcome) {
        this.$mdToast.show(this.$mdToast.simple().textContent(outcome.message));
      }
      this.report = outcome.data;
    } catch (err) {
      this.$mdToast.show(this.$mdToast.simple().textContent('No changes were made'));
    }
  }

  checkChange() {
    if (this.report.type !== this.reportCache.type
      || this.report.state !== this.reportCache.state
      || this.report.reportVersion !== this.reportCache.reportVersion
      || this.report.kbVersion !== this.reportCache.kbVersion) {
      this.reportSettingsChanged = true;
    }

    if (this.reportSettingsChanged
      && JSON.stringify(this.report) === JSON.stringify(this.reportCache)
    ) {
      this.reportSettingsChanged = false;
    }
  }

  async updateSettings() {
    this.reportSettingsChanged = false;

    // Send updated settings to API
    const resp = await this.ReportService.updateReport(this.report);
    this.report = resp;
    this.$scope.$digest();

    this.$mdToast.show(this.$mdToast.simple().textContent('Report settings have been updated.'));
  }

  async deleteReport($event) {
    try {
      const outcome = await this.$mdDialog.show({
        targetEvent: $event,
        template: deleteTemplate,
        clickOutToClose: true,
        controller: ['scope', (scope) => {
          scope.report = this.report;
          scope.confirmText = '';

          scope.cancel = () => {
            this.$mdDialog.hide();
          };

          scope.delete = async (form) => {
            try {
              if (scope.confirmText.toLowerCase() === this.report.ident.toLowerCase()) {
                form.$error.invalid = false;
                const resp = await this.ReportService.deleteReport(this.report);
                this.$mdDialog.hide({ data: resp.data, status: resp.status });
              } else {
                form.$error.invalid = true;
              }
            } catch (err) {
              this.$mdDialog.cancel(err);
            }
          };
        }],
      });

      if (outcome.status === 204) {
        this.$mdToast.show(this.$mdToast.simple().textContent('Report Deleted'));
        this.$state.go('root.reportlisting.reports');
      } else {
        this.$mdToast.show(this.$mdToast.simple().textContent(`Delete Error: ${outcome.data}`));
      }
    } catch (err) {
      if (err.status === 403) {
        this.$mdToast.show(
          this.$mdToast.simple().textContent('You do not have permission to delete reports'),
        );
      } else {
        this.$mdToast.show(
          this.$mdToast.simple().textContent(`Report not deleted: ${err.data.message}`),
        );
      }
    }
  }
}

export default {
  template,
  bindings,
  controller: ReportSettingsComponent,
};
