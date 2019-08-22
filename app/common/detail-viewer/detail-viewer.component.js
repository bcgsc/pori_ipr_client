import omit from 'lodash.omit';
import template from './detail-viewer.pug';
import './detail-viewer.scss';

const bindings = {
  rows: '<',
  index: '<',
};

class DataViewerComponent {
  /* @ngInject */
  constructor($mdDialog) {
    this.$mdDialog = $mdDialog;
  }

  $onInit() {
    this.openDialog();
  }

  openDialog() {
    this.$mdDialog.show({
      clickOutsideToClose: true,
      template,
      controller: ['$scope', ($scope) => {
        // Ignored columns
        const ignored = ['ident', 'id', 'pog_id'];

        $scope.rows = omit(this.rows[this.index], ignored);

        $scope.cancel = () => {
          this.$mdDialog.cancel();
        };
      }],
    });
  }
}

export default {
  bindings,
  controller: DataViewerComponent,
};
