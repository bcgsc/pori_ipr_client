app.directive("iprPrintDiagram", ['$q', '_', '$mdDialog', '$mdToast', ($q, _, $mdDialog, $mdToast) => {


  return {
    restrict: 'E',
    transclude: false,
    scope: {
      sv: '=sv',
      pog: '=pog',
      report: '=report',
    },
    templateUrl: 'print/ipr-print-diagram/ipr-print-diagram.html',
    link: (scope, element, attr) => {

      let sv = scope.sv;

      scope.frame = (frame) => {
        if(frame === 'UNDET') return "Not determined";
        if(frame === 'IN') return "In frame";
        if(frame === 'OUT') return "Out of frame";
      };

      // Extract Ensembl Name from String
      scope.ensemblName = (input) => {
        return _.first(input.match(/(ENS[A-z0-9]*)/));
      };

      // Create SVG DOM element from String
      scope.svg = new DOMParser().parseFromString(sv.svg, 'application/xml');

      let xmlSVG = scope.svg.getElementsByTagName('svg')[0];
      xmlSVG.id="fusionDiagram-" + sv.ident;


      // Load in SVG after delay.
      setTimeout(() => {
        let svgImage = document.getElementById(sv.ident);

        svgImage.appendChild(
          svgImage.ownerDocument.importNode(scope.svg.documentElement, true)
        );
        let panzoom = svgPanZoom("#fusionDiagram-" + sv.ident, {
          preventMouseEventsDefault: true,
          enableControlIcons: true,
        });
        panzoom.resize();
        panzoom.fit();
        panzoom.center();
        panzoom.disablePan();
        panzoom.disableMouseWheelZoom();
        panzoom.disableZoom();
        panzoom.disableDblClickZoom();
      },500);


    } // end link
  } // end return

}]);
