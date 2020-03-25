import template from './svg-viewer.pug';

const bindings = {
  svs: '<',
  pog: '<',
  report: '<',
};

class SvgViewer {
  /* @ngInject */
  constructor($mdDialog, $mdToast) {
    this.$mdDialog = $mdDialog;
    this.$mdToast = $mdToast;
  }

  svDetails($event, sv) {
    this.$mdDialog.show({
      targetEvent: $event,
      template,
      controller: ['scope', ($_scope) => {
        $_scope.sv = sv;

        // Close Modal
        $_scope.cancel = () => {
          $mdDialog.cancel();
        };

        // Extract Ensembl Name from String
        $_scope.ensemblName = (input) => {
          return _.first(input.match(/(ENS[A-z0-9]*)/));
        };

        // Create SVG DOM element from String
        $_scope.svg = new DOMParser().parseFromString(sv.svg, 'application/xml');

        let xmlSVG = $_scope.svg.getElementsByTagName('svg')[0];
        xmlSVG.id="fusionDiagram";


        // Load in SVG after delay.
        setTimeout(() => {
          let svgImage = document.getElementById('svgImage');

          svgImage.appendChild(
            svgImage.ownerDocument.importNode($_scope.svg.documentElement, true)
          );
          let panzoom = svgPanZoom('#fusionDiagram', {
            preventMouseEventsDefault: true,
            enableControlIcons: true,
          });
          panzoom.resize();
          panzoom.fit();
          panzoom.center();
        }, 500);
      }],
    });
  }
}

export default {
  bindings,
  controller: SvgViewer,
};
