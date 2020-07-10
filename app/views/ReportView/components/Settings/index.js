import { angular2react } from 'angular2react';
import { $rootScope } from 'ngimport';

import indefiniteArticle from '@/services/utils/indefiniteArticle';
import toastCreator from '@/services/utils/toastCreator';
import { searchUsers } from '@/services/management/auth';
import lazyInjector from '@/lazyInjector';
import template from './report-settings.pug';
import addTemplate from './role-add.pug';
import deleteTemplate from './report-delete.pug';
import ReportService from '@/services/reports/report.service';

import './index.scss';

const bindings = {
  report: '<',
  showBindings: '<',
  history: '<',
};

class Settings {
  constructor($mdDialog, $mdToast) {
    this.$mdDialog = $mdDialog;
    this.$mdToast = $mdToast;
  }

  $onInit() {
    this.roles = ['bioinformatician', 'analyst', 'reviewer', 'admin', 'clinician'];
    this.reportSettingsChanged = false;
  }

  async $onChanges(changes) {
    if (changes.report && changes.report.currentValue) {
      this.reportCache = angular.copy(this.report);
    }
  }

  // Unbind user
  async removeEntry(role) {
    const result = await ReportService.unbindUser(
      this.report.ident, role.user.ident, role.role,
    );
    this.report = result;
    $rootScope.$digest();
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
        parent: angular.element(document.body),
        controller: ['scope', (scope) => {
          scope.role = { role: suggestedRole };

          scope.cancel = () => {
            this.$mdDialog.cancel();
          };

          scope.searchUsers = async (searchText) => {
            if (searchText.length === 0) {
              return [];
            }

            const resp = await searchUsers(searchText);
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
            const resp = await ReportService.bindUser(
              this.report.ident, scope.role.user.ident, scope.role.role,
            );
            this.$mdDialog.hide({
              data: resp,
              message: `${scope.role.user.firstName} ${scope.role.user.lastName} has been added as ${indefiniteArticle(scope.role.role)} ${scope.role.role}`,
            });
          };
        }],
      });
      if (outcome) {
        this.$mdToast.show(toastCreator(outcome.message));
        $rootScope.$digest();
      }
      this.report = outcome.data;
    } catch (err) {
      this.$mdToast.show(toastCreator('No changes were made'));
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
    const resp = await ReportService.updateReport(this.report);
    this.report = resp;
    $rootScope.$digest();

    this.$mdToast.show(toastCreator('Report settings have been updated.'));
  }

  async deleteReport($event) {
    try {
      const outcome = await this.$mdDialog.show({
        targetEvent: $event,
        template: deleteTemplate,
        clickOutToClose: true,
        parent: angular.element(document.body),
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
                const resp = await ReportService.deleteReport(this.report);
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
        this.$mdToast.show(toastCreator('Report Deleted'));
        this.history.push('/reports');
      } else {
        this.$mdToast.show(toastCreator(`Delete Error: ${outcome.data}`));
      }
    } catch (err) {
      if (err.status === 403) {
        this.$mdToast.show(toastCreator('You do not have permission to delete reports'));
      } else {
        this.$mdToast.show(toastCreator(`Report not deleted: ${err.data.message}`));
      }
    }
  }
}

Settings.$inject = ['$mdDialog', '$mdToast'];

export const SettingsComponent = {
  template,
  bindings,
  controller: Settings,
};

export default angular2react('settings', SettingsComponent, lazyInjector.$injector);
