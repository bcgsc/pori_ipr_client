import { angular2react } from 'angular2react';
import { $rootScope } from 'ngimport';

import indefiniteArticle from '@/utils/indefiniteArticle';
import toastCreator from '@/utils/toastCreator';
import { searchUsers, getUser } from '@/services/management/auth';
import { formatDate } from '@/utils/date';
import lazyInjector from '@/lazyInjector';
import template from './report-settings.pug';
import addTemplate from './role-add.pug';
import deleteTemplate from './report-delete.pug';
import ReportService from '@/services/reports/report.service';
import api from '@/services/api';

import './index.scss';

const bindings = {
  report: '<',
  showBindings: '<',
  history: '<',
  isSigned: '<',
};

class Settings {
  constructor($mdDialog, $mdToast) {
    this.$mdDialog = $mdDialog;
    this.$mdToast = $mdToast;
  }

  $onInit() {
    this.roles = ['bioinformatician', 'analyst', 'reviewer', 'admin', 'clinician'];
    this.dirtyFields = {};
    this.reportSettingsChanged = false;
    this.newReportFields = {};
    this.formatDate = formatDate;
  }

  async $onChanges(changes) {
    if (changes.report && changes.report.currentValue) {
      this.reportCache = angular.copy(this.report);
      this.user = await getUser();
      this.canStartAnalysis = this.report.users.some(({ user: { username } }) => username === this.user.username);
      $rootScope.$digest();
    }
  }

  // Unbind user
  async removeEntry(role) {
    const result = await ReportService.unbindUser(
      this.report.ident, role.user.ident, role.role,
    );
    this.report = result;
    this.canStartAnalysis = this.report.users.some(({ user: { username } }) => username === this.user.username);
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
      this.canStartAnalysis = this.report.users.some(({ user: { username } }) => username === this.user.username);
    } catch (err) {
      this.$mdToast.show(toastCreator('No changes were made'));
    }
  }

  checkChange() {
    if (this.report.type !== this.reportCache.type) {
      this.newReportFields.type = this.report.type;
      this.reportSettingsChanged = true;
    }
    if (this.report.state !== this.reportCache.state) {
      this.newReportFields.state = this.report.state;
      this.reportSettingsChanged = true;
    }
    if (this.report.reportVersion !== this.reportCache.reportVersion) {
      this.newReportFields.reportVersion = this.report.reportVersion;
      this.reportSettingsChanged = true;
    }
    if (this.report.kbVersion !== this.reportCache.kbVersion) {
      this.newReportFields.kbVersion = this.report.kbVersion;
      this.reportSettingsChanged = true;
    }

    if (this.report.kbVersion !== this.reportCache.kbVersion) {
      this.dirtyFields.kbVersion = this.report.kbVersion;
    }

    if (Object.values(this.dirtyFields).length > 0) {
      this.reportSettingsChanged = true;
    }
    this.$rootScope.$digest();
  }

  async updateSettings() {
    this.reportSettingsChanged = false;

    const call = api.put(`/reports/${this.report.ident}`, this.newReportFields);
    let resp;
    if (this.isSigned && Object.keys(this.newReportFields).some(field => field !== 'state')) {
      resp = await call.request(true);
    } else {
      resp = await call.request();
    }
    this.report = resp;
    this.dirtyFields = {};
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

  async startAnalysis() {
    const date = new Date();
    const resp = await ReportService.updateReport(this.report.ident, { analysisStartedAt: date.toISOString() });
    this.report = resp;
    $rootScope.$digest();
  }
}

Settings.$inject = ['$mdDialog', '$mdToast'];

export const SettingsComponent = {
  template,
  bindings,
  controller: Settings,
};

export default angular2react('settings', SettingsComponent, lazyInjector.$injector);
