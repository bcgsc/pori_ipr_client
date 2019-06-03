import omit from 'lodash.omit';
import template from './detail-viewer.pug';
import './detail-viewer.scss';

const bindings = {
  mutations: '<',
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

        $scope.mutations = omit(this.mutations[this.index], ignored);

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
