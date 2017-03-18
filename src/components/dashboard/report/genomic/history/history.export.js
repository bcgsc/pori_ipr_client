app.controller('controller.dashboard.report.genomic.history.export',
['_', '$q', '$scope', '$state', '$mdDialog', '$mdToast', '$timeout', 'api.pog', 'api.pogDataHistory', 'pog',
(_, $q, scope, $state, $mdDialog, $mdToast, $timeout, $pog, $history, pog) => {

  // Load in values needed
  scope.pog = pog;

  // Default stage is start
  scope.stage = 'start';
  scope.command = '';

  scope.export = {};

  scope.changeCopyTooltip = () => {
    scope.copyTooltip = 'Copied!';
    $timeout(()=> {
      scope.copyTooltip = "Copy to clipboard";
    },3000);
    $mdToast.show($mdToast.simple().textContent('Copied to clipboard!'));
  };

  // Close window function
  scope.cancel = () => { $mdDialog.cancel() };

  scope.runExport = () => {
    scope.stage = 'running';


    $pog.export(pog.POGID).csv().then(
      (resp) => {
        scope.command = resp.command;
        scope.export = resp.export;
        scope.stage = 'complete';

        $mdToast.show($mdToast.simple().textContent('Export successfully generated'));
      },
      (err) => {
        console.log('Failed to finished export');

      }
    );

  };

}]);
