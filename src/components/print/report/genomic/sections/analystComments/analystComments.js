app.controller('controller.print.POG.report.genomic.analystComments',
['_', '$scope', '$sce', 'pog', 'report', 'comments', 'api.summary.analystComments',
(_, $scope, $sce, pog, report, comments, $comments) => {

  // Data
  $scope.comments = comments;
  $scope.report = report;
  $scope.pog = pog;
  $scope.analystParagraphs = [];

  let rawParagraphs = (comments) ? comments.comments.replace("<p>", "").split("</p>") : ["<h1> Draft Report</h1>", "No comments yet."];

  _.forEach(rawParagraphs, (p) => {
    if(p.length > 0) $scope.analystParagraphs.push($sce.trustAsHtml(p));
  });

}]);