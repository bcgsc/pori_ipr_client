import { $sce, $rootScope } from 'ngimport';
import { angular2react } from 'angular2react';

import toastCreator from '@/utils/toastCreator';
import lazyInjector from '@/lazyInjector';
import AnalystCommentsService from '@/services/reports/analyst-comments.service';
import { getSignatures, sign, revokeSignature } from '@/services/reports/signatures';
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

  $onInit() {
    this.loading = true;
  }

  async $onChanges(changes) {
    if (changes.report && changes.report.currentValue) {
      this.analystComments = await AnalystCommentsService.get(this.report.ident);
      this.signatures = await getSignatures(this.report.ident);
      this.loading = false;
      $rootScope.$digest();
    }
  }

  // Sign The comments
  async sign(role) {
    const resp = await sign(this.report.ident, role);
    this.signatures = resp;
    $rootScope.$digest();
  }

  // Sign The comments
  async revokeSign(role) {
    const resp = await revokeSignature(
      this.report.ident, role,
    );
    this.signatures = resp;
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
