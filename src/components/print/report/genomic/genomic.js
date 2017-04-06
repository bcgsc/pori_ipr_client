app.controller('controller.print.POG.report.genomic',
  ['_', '$scope', '$timeout', 'pog', 'gai', 'get', 'ms', 'vc', 'pt', 'comments', 'pathway', 'therapeutic',
  (_, $scope, $timeout, pog, gai, get, ms, vc, pt, comments, pathway, therapeutic) => {

    // Data
    $scope.data = {gai: gai, ms: ms, vc: vc, pt: pt, pi: pog.patientInformation, ta: pog.tumourAnalysis };

    let initChunk = 9;

    $scope.data.get = [];
    $scope.data.get[0] = _.chunk(get, initChunk)[0];
    $scope.data.get[1] = _.chain(get).chunk(initChunk).tail().flatten().value();
    $scope.analystComments = comments;
    $scope.pathwayAnalysis = pathway;
    $scope.therapeutic = {therapeutic: [], chemoresistance: []};

    // Sort into groups
    let groupTherapeutics = () => {
      _.forEach(therapeutic, (v) => {
        if(v.type === 'therapeutic') $scope.therapeutic.therapeutic.push(v);
        if(v.type === 'chemoresistance') $scope.therapeutic.chemoresistance.push(v);
      });
    };

    groupTherapeutics();


    /*
    // Create SVG DOM element from String
    $scope.pathway = new DOMParser().parseFromString(pathway.pathway, 'application/xml');

    // Extract SVG element from within XML wrapper.
    let xmlSVG = $scope.pathway.getElementsByTagName('svg')[0];
    xmlSVG.id="pathway"; // Set ID that we can grapple.
    xmlSVG.style = 'width: 190mm; height: 190mm;'; // Set width & height TODO: Make responsive

    // Create PanZoom object
    let panZoom = {};

    // Load in SVG after slight delay. (otherwise xmlSVG processing isn't ready.
    // TODO: Use promises to clean this up.
    setTimeout(() => {
      let svgImage = document.getElementById('svgImage');

      svgImage.appendChild(
        svgImage.ownerDocument.importNode($scope.pathway.documentElement, true)
      );
    },100);
    */

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
      },100);

    };

    $timeout(() => {
      if(pathway !== null) processSVG(pathway.pathway);
      if(pathway === null) processSVG('<?xml version="1.0" encoding="UTF-8"?><svg xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:svg="http://www.w3.org/2000/svg" xmlns="http://www.w3.org/2000/svg" version="1.1" xml:space="preserve" width="400"><text x="0" y="0" fill="rgb(210,210,210)">Pathway not yet analyzed.</text></svg>');
    }, 500);

    $scope.pog = pog;

    $scope.col1 = 10;
    $scope.col2 = 25;
    $scope.col3 = 10;
    $scope.col4 = 25;
    $scope.col5 = 10;
    $scope.col6 = 35;

    $scope.mutationBurdenFilter = (input) => {
      return (input == "nan [nan]") ? 'na' : input.replace(/\[[0-9]*\]/g, '');
    }

  }]
);