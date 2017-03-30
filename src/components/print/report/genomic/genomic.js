app.controller('controller.print.POG.report.genomic',
  ['_', '$scope', 'pog', 'gai', 'get', 'ms', 'vc', 'pt', 'comments', 'pathway', 'therapeutic',
  (_, $scope, pog, gai, get, ms, vc, pt, comments, pathway, therapeutic) => {

    // Data
    $scope.data = {gai: gai, ms: ms, vc: vc, pt: pt, pi: pog.patientInformation, ta: pog.tumourAnalysis };

    $scope.data.get = [];
    $scope.data.get[0] = _.chunk(get, 11)[0];
    $scope.data.get[1] = _.chain(get).chunk(11).tail().flatten().value();
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