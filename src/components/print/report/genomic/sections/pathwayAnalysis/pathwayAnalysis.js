app.controller('controller.print.POG.report.genomic.pathwayAnalysis',
['_', '$scope', '$timeout', 'pog', 'report', 'pathway',
(_, $scope, $timeout, pog, report, pathway) => {

  // Data
  $scope.report = report;
  $scope.pog = pog;
  $scope.pathwayAnalysis = pathway;

  let processSVG = (svg) => {

    // Get container div
    let svgImage = document.getElementById('svgImage');

    if(svgImage.innerHTML.length > 0) {
      // Destroy so we can build it bigger, faster, better than before!
      svgImage.innerHTML = '';
    }

    // Create SVG DOM element from String
    $scope.pathway = new DOMParser().parseFromString(svg, 'application/xml');

    // Extract SVG element from within XML wrapper.
    let xmlSVG = $scope.pathway.getElementsByTagName('svg')[0];
    xmlSVG.id="pathway"; // Set ID that we can grapple.
    xmlSVG.style = 'width: 100%; height: 800px;'; // Set width & height TODO: Make responsive

    // Create PanZoom object
    let panZoom = {};

    // Load in SVG after slight delay. (otherwise xmlSVG processing isn't ready.
    // TODO: Use promises to clean this up.
    setTimeout(() => {
      svgImage = document.getElementById('svgImage');

      svgImage.appendChild(
        svgImage.ownerDocument.importNode($scope.pathway.documentElement, true)
      );
      let panZoom = svgPanZoom('#pathway', {
        preventMouseEventsDefault: true,
        enableControlIcons: false,
        controlIconsEnabled: false
      });
      panZoom.resize();
      panZoom.fit();
      panZoom.center();
      panZoom.disablePan();
      panZoom.disableMouseWheelZoom();
      panZoom.disableZoom();
      panZoom.disableDblClickZoom();
    },100);

  };

  $timeout(() => {
    if(pathway !== null) processSVG(pathway.pathway);
    if(pathway === null) processSVG('<?xml version="1.0" encoding="UTF-8"?><svg xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:svg="http://www.w3.org/2000/svg" xmlns="http://www.w3.org/2000/svg" version="1.1" xml:space="preserve" width="400"><text x="0" y="0" fill="rgb(210,210,210)">Pathway not yet analyzed.</text></svg>');
  }, 500);

}]);