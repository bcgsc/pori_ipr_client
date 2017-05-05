app.controller('controller.print.POG.report.genomic.analystComments',
['_', '$scope', '$sce', 'pog', 'report', 'comments',
(_, $scope, $sce, pog, report, comments) => {

  // Data
  $scope.report = report;
  $scope.pog = pog;
  $scope.analystParagraphs = [];

  let rawParagraphs = (comments) ? comments.comments.replace("<p>", "").split("</p>") : ["<h1> Draft Report</h1>", "No comments yet."];

  _.forEach(rawParagraphs, (p) => {
    if(p.length > 0) $scope.analystParagraphs.push($sce.trustAsHtml(p));
  });


}]);