app.directive("iprSv", ['$q', '_', '$mdDialog', '$mdToast', ($q, _, $mdDialog, $mdToast) => {


  return {
    restrict: 'E',
    transclude: false,
    scope: {
      svs: '=svs',
      pog: '=pog'
    },
    templateUrl: 'ipr-sv/ipr-sv.html',
    link: (scope, element, attr) => {

      scope.svDetails = ($event, sv) => {

        $mdDialog.show({
          targetEvent: $event,
          templateUrl: 'ipr-sv/ipr-sv.detail.html',
          controller: ['$q', 'scope', ($q, $_scope) => {
            $_scope.sv = sv;

            // Close Modal
            $_scope.cancel = () => {
              $mdDialog.cancel();
            }

            // Extract Ensembl Name from String
            $_scope.ensemblName = (input) => {
              return _.first(input.match(/(ENS[A-z0-9]*)/));
            }

            // Create SVG DOM element from String
            $_scope.svg = new DOMParser().parseFromString(sv.svg, 'application/xml');

            let xmlSVG = $_scope.svg.getElementsByTagName('svg')[0];
            console.log($_scope.svg.getElementsByTagName('svg')[0]);
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
            },500);

          }],
          clickOutToClose: false
        });

      }

    } // end link
  } // end return

}]);
