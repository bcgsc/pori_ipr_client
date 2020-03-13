import template from './gene-viewer.pug';
import './gene-viewer.scss';

const bindings = {
  report: '<',
  gene: '<',
};

class GeneViewerComponent {
  /* @ngInject */
  constructor($mdDialog, GeneViewerService) {
    this.$mdDialog = $mdDialog;
    this.GeneViewerService = GeneViewerService;
  }

  $onInit() {
    this.openDialog();
  }

  openDialog() {
    this.$mdDialog.show({
      clickOutsideToClose: true,
      template,
      controller: ['$scope', async ($scope) => {
        /* Using an object for detail here since the DOM will make a new scope in an ng-repeat */
        /* And we can't use $ctrl outside of a template associated to a component */
        $scope.detail = {
          clicked: false,
          index: null,
        };
        $scope.loading = true;
        $scope.report = this.report;
        $scope.gene = this.gene;
        $scope.samples = [];
        $scope.alterations = {
          therapeutic: [], prognostic: [], diagnostic: [], biological: [], unknown: [],
        };
        $scope.data = await this.GeneViewerService.get(
          $scope.report.ident, $scope.gene,
        );

        $scope.groupEntries = (alterations) => {
          // Process the entries for grouping
          alterations.forEach((row) => {
            // Add to samples if not present
            if (!$scope.samples.includes(row.sample)) {
              $scope.samples.push(row.sample);
            }
            // Create new alteration type if it's not existing
            if (!(Object.prototype.hasOwnProperty.call($scope.alterations, row.alterationType))) {
              $scope.alterations[row.alterationType] = [];
            }
            // Check if it exists already?
            if ($scope.alterations[row.alterationType].length) {
              const match = $scope.alterations[row.alterationType].findIndex(entry => ((entry.gene === row.gene) && (entry.variant === row.variant)));
              if (match > -1) {
                // Categorical entry already exists
                $scope.alterations[row.alterationType][match].children.push(row);
              } else {
                row.children = [];
                $scope.alterations[row.alterationType].push(row);
              }
            } else {
              row.children = [];
              $scope.alterations[row.alterationType].push(row);
            }
          });
          $scope.loading = false;
          $scope.$digest();
        };

        $scope.groupEntries($scope.data.kbMatches);

        $scope.cancel = () => {
          this.$mdDialog.cancel();
        };
      }],
    });
  }
}

export default {
  bindings,
  controller: GeneViewerComponent,
};
