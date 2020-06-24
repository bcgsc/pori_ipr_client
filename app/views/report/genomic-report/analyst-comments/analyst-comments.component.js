import template from './analyst-comments.pug';
import editTemplate from './analyst-comments-edit.pug';
import './analyst-comments.scss';

const bindings = {
  print: '<',
  report: '<',
  reportEdit: '<',
  analystComments: '<',
  signatures: '<',
};

class AnalystCommentsComponent {
  /* @ngInject */
  constructor($scope, $mdDialog, $mdToast, $sce, AnalystCommentsService, SignatureService) {
    this.$scope = $scope;
    this.$mdDialog = $mdDialog;
    this.$mdToast = $mdToast;
    this.$sce = $sce;
    this.AnalystCommentsService = AnalystCommentsService;
    this.SignatureService = SignatureService;
  }

  // Sign The comments
  async sign(role) {
    const resp = await this.SignatureService.sign(this.report.ident, role);
    this.signatures = resp;
    this.$scope.$digest();
  }

  // Sign The comments
  async revokeSign(role) {
    const resp = await this.SignatureService.revoke(
      this.report.ident, role,
    );
    this.signatures = resp;
    this.$scope.$digest();
  }

  // Editor Update Modal
  async updateComments($event) {
    try {
      const resp = await this.$mdDialog.show({
        targetEvent: $event,
        template: editTemplate,
        clickOutToClose: false,
        controller: ['scope', (scope) => {
          scope.analystComments = this.analystComments;
          // Cancel Dialog
          scope.cancel = () => {
            this.$mdDialog.cancel('Canceled Edit - No changes made.');
          };
          // Update Details
          scope.update = async () => {
            try {
              await this.AnalystCommentsService.update(
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
      this.$mdToast.show(this.$mdToast.simple().textContent(resp.message));
    } catch (err) {
      this.$mdToast.show(this.$mdToast.simple().textContent(err));
    } finally {
      this.$scope.$digest();
    }
  }
}

export default {
  template,
  bindings,
  controller: AnalystCommentsComponent,
};
