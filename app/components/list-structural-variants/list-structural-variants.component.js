import * as svgPanZoom from 'svg-pan-zoom';
import template from './list-structural-variants.pug';
import detailTemplate from './list-structural-variants-detail.pug';
import './list-structural-variants.scss';

const bindings = {
  svs: '<',
  report: '<',
};

class ListStructuralVariantsComponent {
  /* @ngInject */
  constructor($mdDialog, $mdToast) {
    this.$mdDialog = $mdDialog;
    this.$mdToast = $mdToast;
  }

  svDetails($event, sv) {
    this.$mdDialog.show({
      targetEvent: $event,
      template: detailTemplate,
      onComplete: async ($scope) => {
        /* Needed in order to get the element after the dialog has initialized */
        /* This is due to the DOM not being rendered right away */
        /* Note: $mdDialog has no other function with $onInit capabilities */
        const svgImage = document.getElementById('svgImage');
        // Create SVG DOM element from String
        $scope.svg = new DOMParser().parseFromString(sv.svg, 'application/xml');
        $scope.svg.children[0].id = 'fusionDiagram';
        svgImage.appendChild(
          svgImage.ownerDocument.importNode($scope.svg.documentElement, true),
        );

        const panzoom = await svgPanZoom('#fusionDiagram', {
          preventMouseEventsDefault: true,
          enableControlIcons: true,
        });
        panzoom.resize();
        panzoom.fit();
        panzoom.center();
      },
      controller: ['scope', ($scope) => {
        $scope.sv = sv;
        $scope.cancel = () => {
          this.$mdDialog.cancel();
        };

        // Extract Ensembl Name from String
        $scope.ensemblName = input => input.match(/(ENS[A-z0-9]*)/)[0];
      }],
      clickOutToClose: true,
    });
  }
}

export default {
  template,
  bindings,
  controller: ListStructuralVariantsComponent,
};
