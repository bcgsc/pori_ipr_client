import { $sce, $rootScope } from 'ngimport';
import { angular2react } from 'angular2react';

import toastCreator from '@/services/utils/toastCreator';
import lazyInjector from '@/lazyInjector';
import AnalystCommentsService from '@/services/reports/analyst-comments/analyst-comments.service';
import template from './analyst-comments.pug';
import editTemplate from './analyst-comments-edit.pug';

import 'quill/dist/quill.snow.css';
import './index.scss';

const bindings = {
  print: '<',
  report: '<',
  reportEdit: '<',
};

class AnalystComments {
  constructor($mdDialog, $mdToast) {
    this.$sce = $sce;
    this.$mdToast = $mdToast;
    this.$mdDialog = $mdDialog;
  }

  async $onChanges(changes) {
    if (changes.report && changes.report.currentValue) {
      this.analystComments = await AnalystCommentsService.get(this.report.ident);
      $rootScope.$digest();
    }
  }

  // Sign The comments
  async sign(role) {
    const resp = await AnalystCommentsService.sign(this.report.ident, role);
    this.analystComments = resp;
    $rootScope.$digest();
  }

  // Sign The comments
  async revokeSign(role) {
    const resp = await AnalystCommentsService.revokeSign(
      this.report.ident, role,
    );
    this.analystComments = resp;
    $rootScope.$digest();
  }

  // Editor Update Modal
  async updateComments($event) {
    try {
      const resp = await this.$mdDialog.show({
        targetEvent: $event,
        template: editTemplate,
        clickOutToClose: false,
        parent: angular.element(document.body),
        controller: ['scope', (scope) => {
          scope.analystComments = this.analystComments;
          // Cancel Dialog
          scope.cancel = () => {
            this.$mdDialog.cancel('Canceled Edit - No changes made.');
          };
          // Update Details
          scope.update = async () => {
            try {
              await AnalystCommentsService.update(
                this.report.ident, scope.analystComments,
              );
              this.$mdDialog.hide({
                message: 'Entry has been updated',
                comment: scope.analystComments,
              });
            } catch (err) {
              alert('Unable to update. See console');
              console.log(err);
            }
          };
        }],
      });
      // Update current page content
      this.analystComments = resp.comment;
      this.analystComments.comments = resp.comment.comments;
      // Display Message from Hiding
      this.$mdToast.show(toastCreator(resp.message));
    } catch (err) {
      this.$mdToast.show(toastCreator(err));
    }
  }
}

AnalystComments.$inject = ['$mdDialog', '$mdToast'];

export const AnalystCommentsComponent = {
  template,
  bindings,
  controller: AnalystComments,
};

export default angular2react('analystComments', AnalystCommentsComponent, lazyInjector.$injector);
