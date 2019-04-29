import template from './small-mutation-variants.pug';
import dataTemplate from './data-viewer.pug';
import './data-viewer.scss';

const bindings = {
  mutations: '<',
  pog: '<',
  report: '<',
};

class SmallMutationVariantsComponent {
  /* @ngInject */
  constructor($mdDialog) {
    this.$mdDialog = $mdDialog;
  }

  /* eslint-disable-next-line class-methods-use-this */
  copyFilter(copyChange) {
    if (copyChange) {
      return (copyChange === 'na') ? 'na' : copyChange.match(/(((\+|-)?)[0-9]{1,2})/g)[0];
    }
    return null;
  }

  openDialog($event, $index) {
    this.$mdDialog.show({
      clickOutsideToClose: true,
      targetEvent: $event,
      template: dataTemplate,
      controller: ['$scope', ($scope) => {
        // Ignored columns
        const ignored = ['ident', 'id', 'pog_id'];

        $scope.mutations = _.omit(this.mutations[$index], ignored);

        $scope.cancel = () => {
          this.$mdDialog.cancel();
        };
      }],
    });
  }
}

export default {
  template,
  bindings,
  controller: SmallMutationVariantsComponent,
};
