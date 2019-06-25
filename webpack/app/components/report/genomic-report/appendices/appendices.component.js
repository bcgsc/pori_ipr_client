app.controller('controller.dashboard.report.genomic.appendices',
  ['_', '$q', '$scope', 'api.pog', '$mdDialog', '$mdToast', 'pog', 'report', 'tcgaAcronyms',
    (_, $q, $scope, $pog, $mdDialog, $mdToast, pog, report, tcga) => {

      $scope.pog = pog;
      $scope.report = report;
      $scope.tcga = tcga;

      $scope.hashClean = (i) => {
        return String(i).replace('#','');
      }

    }
  ]
);
